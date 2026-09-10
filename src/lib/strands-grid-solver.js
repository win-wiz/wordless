/**
 * Strands 生成期铺网求解器（仅生成脚本使用，不进客户端 bundle）。
 *
 * 实现 doc/strands-game-design.md 中的生成契约：组合筛选（§4.3）、
 * 网格铺设引擎（§4.4）与 validWords 收集（§4.5）。
 */

import {
  DIRS,
  HEIGHT,
  TOTAL_CELLS,
  WIDTH,
  cellAt,
  defined,
  pathTouchesOppositeEdges,
  setCell,
} from './strands-engine.js';

/**
 * @typedef {import('./strands-engine.js').StrandsPoint} StrandsPoint
 */

/**
 * §4.3 组合筛选：从候选词中找出总长恰好 targetLength 的 { spangram, words }
 * 组合（主题词 4–8 个），最多 maxResults 个。
 * 排序策略（对齐 NYT 手感）：
 * ① 主题词数量分档：≥6 个最优（原版常见 7~9 个答案词），5 个次之，4 个兜底
 * ② 同档内"最长主题词更短"优先（原版主题词以 4~9 字母为主，超长词盲找成本高）
 * ③ 再按 spangram 更短优先（原版 spangram 常见 8~12 字母，15 顶格偏难）
 * 各档先随机打乱再稳定排序，等长时保留随机性。
 *
 * @param {{ spangrams: string[], words: string[], targetLength?: number, maxResults?: number }} input
 * @returns {{ spangram: string, words: string[] }[]}
 */
export function findValidCombinations({ spangrams, words, targetLength = 48, maxResults = 200 }) {
  const uniqueWords = [...new Set(words)];
  const uniqueSpangrams = [...new Set(spangrams)];
  /** @type {{ spangram: string, words: string[] }[]} */
  const results = [];

  for (const spangram of uniqueSpangrams) {
    const remainingTarget = targetLength - spangram.length;
    const available = uniqueWords.filter((w) => w !== spangram).sort((a, b) => b.length - a.length);
    /** @type {string[]} */
    const subset = [];

    /**
     * @param {number} startIndex
     * @param {number} currentLength
     */
    const findSubsets = (startIndex, currentLength) => {
      if (results.length >= maxResults) return;
      if (currentLength === remainingTarget) {
        if (subset.length >= 4 && subset.length <= 8) {
          results.push({ spangram, words: [...subset] });
        }
        return;
      }
      if (currentLength > remainingTarget || subset.length >= 8) return;
      for (let i = startIndex; i < available.length; i++) {
        const w = defined(available[i]);
        // 剪枝：available 降序，剩下 (8 - subset.length) 个槽全填 w.length 都不够 → break
        if (currentLength + (8 - subset.length) * w.length < remainingTarget) break;
        if (currentLength + w.length <= remainingTarget) {
          subset.push(w);
          findSubsets(i + 1, currentLength + w.length);
          subset.pop();
        }
      }
    };
    findSubsets(0, 0);
  }

  /**
   * Fisher-Yates 随机打乱
   * @param {{ spangram: string, words: string[] }[]} list
   */
  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = defined(list[i]);
      const b = defined(list[j]);
      list[i] = b;
      list[j] = a;
    }
    return list;
  };

  /**
   * 组合难度档位：0 = 主题词 ≥6（原版常见手感），1 = 5 个，2 = 4 个兜底
   * @param {{ spangram: string, words: string[] }} combo
   */
  const difficultyTier = (combo) =>
    combo.words.length >= 6 ? 0 : combo.words.length === 5 ? 1 : 2;
  /**
   * 最长主题词长度（越短手感越接近原版）
   * @param {{ spangram: string, words: string[] }} combo
   */
  const maxWordLength = (combo) => Math.max(...combo.words.map((w) => w.length));
  // 先整体随机打乱，再按 词数档位 → 最长主题词 → spangram 长度 逐级稳定排序
  return shuffle(results).sort(
    (a, b) =>
      difficultyTier(a) - difficultyTier(b) ||
      maxWordLength(a) - maxWordLength(b) ||
      a.spangram.length - b.spangram.length,
  );
}

const MAX_ITERATIONS = 200000;

// 唯一路径检查的 DFS 访问量按此比例折算迭代数（1 次迭代 ≈ 50 次 DFS 访问），
// 使 MAX_ITERATIONS 同时约束铺网回溯与唯一性检查的总开销
const UNIQUENESS_VISITS_PER_ITERATION = 50;

/** 让出事件循环，避免长时间 DFS 阻塞。 */
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * 规范化边 key：两端点按 (r, c) 字典序排列。
 *
 * @param {StrandsPoint} a
 * @param {StrandsPoint} b
 * @returns {string} 'r1,c1-r2,c2'
 */
function edgeKeyOf(a, b) {
  const first = b.r < a.r || (b.r === a.r && b.c < a.c) ? b : a;
  const second = first === a ? b : a;
  return `${first.r},${first.c}-${second.r},${second.c}`;
}

/**
 * §4.4 网格铺设引擎：DFS 回溯把 spangram + 主题词铺满 6×8 网格。
 * 排序 spangram 最前、其余长度降序；Warnsdorff 启发走子；flood-fill
 * 连通区域剪枝；禁止对角线 X 交叉；spangram 必须触达相对两边。
 */
export class GridSolver {
  /**
   * @param {{ text: string, isSpangram: boolean }[]} words
   * @param {{ requireUniquePaths?: boolean }} [options]
   *   requireUniquePaths（§4.4 方案A）：每个词铺完即检查"已铺的词在当前网格上
   *   仍各自只有唯一可连路径"，不满足立即回溯。后续铺词只会增加不会减少已有词的
   *   可选路径，因此铺完时全部唯一 ⇒ 最终网格唯一，玩家不存在非官方路径可走。
   */
  constructor(words, options = {}) {
    this.words = [...words].sort((a, b) => {
      if (a.isSpangram !== b.isSpangram) return a.isSpangram ? -1 : 1;
      return b.text.length - a.text.length;
    });
    /** @type {string[][]} */
    this.grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(''));
    /** @type {Set<string>} */
    this.usedEdges = new Set();
    this.iterations = 0;
    this.requireUniquePaths = options.requireUniquePaths === true;
  }

  /**
   * 已铺的 wordIndex 及之前的词在当前（部分）网格上是否各自唯一路径。
   * spangram 只计触达对边的路径（引擎只接受触边 spangram，非触边路径不构成歧义）。
   * DFS 开销按比例计入 this.iterations（UNIQUENESS_VISITS_PER_ITERATION 次访问折
   * 1 次迭代）——既纳入 MAX_ITERATIONS 节流防失控，又不至于让路径检查饿死铺网搜索。
   * @param {number} wordIndex 刚铺完的词下标
   * @returns {boolean}
   */
  placedWordsStayUnique(wordIndex) {
    const budget = { count: 0 };
    try {
      for (let i = 0; i <= wordIndex; i++) {
        const placed = defined(this.words[i]);
        const paths = countWordPaths(placed.text, this.grid, 2, {
          edgeSpanOnly: placed.isSpangram,
          budget,
        });
        if (paths > 1) return false;
      }
      return true;
    } finally {
      this.iterations += Math.ceil(budget.count / UNIQUENESS_VISITS_PER_ITERATION);
    }
  }

  /**
   * @returns {Promise<string[][] | null>} 成功返回 8x6 网格，失败返回 null
   */
  async generate() {
    const total = this.words.reduce((sum, w) => sum + w.text.length, 0);
    if (total !== TOTAL_CELLS) return null;
    const ok = await this.solve(0);
    return ok ? this.grid.map((row) => [...row]) : null;
  }

  /**
   * @param {number} wordIndex
   * @returns {Promise<boolean>}
   */
  async solve(wordIndex) {
    this.iterations++;
    if (this.iterations % 10000 === 0) await yieldToEventLoop();
    if (this.iterations > MAX_ITERATIONS) return false;

    if (wordIndex === this.words.length) return true;

    // 剪枝 1：剩余词放不下的布局提前放弃
    const remainingLengths = this.words.slice(wordIndex).map((w) => w.text.length);
    if (!this.isValidEmptySpace(remainingLengths)) return false;

    const word = defined(this.words[wordIndex]);
    for (let r = 0; r < HEIGHT; r++) {
      for (let c = 0; c < WIDTH; c++) {
        if (cellAt(this.grid, r, c) !== '') continue;
        if (await this.placeLetter(wordIndex, 0, r, c, [], word)) return true;
      }
    }
    return false;
  }

  /**
   * @param {number} wordIndex
   * @param {number} charIndex
   * @param {number} r
   * @param {number} c
   * @param {StrandsPoint[]} path
   * @param {{ text: string, isSpangram: boolean }} word
   * @returns {Promise<boolean>}
   */
  async placeLetter(wordIndex, charIndex, r, c, path, word) {
    this.iterations++;
    if (this.iterations % 10000 === 0) await yieldToEventLoop();
    if (this.iterations > MAX_ITERATIONS) return false;

    if (r < 0 || r >= HEIGHT || c < 0 || c >= WIDTH) return false;
    if (cellAt(this.grid, r, c) !== '') return false;

    /** @type {string | null} */
    let edgeKey = null;
    if (charIndex > 0) {
      const prev = defined(path[path.length - 1]);
      if (this.isCrossingDiagonal(prev, { r, c })) return false;
      edgeKey = edgeKeyOf(prev, { r, c });
      this.usedEdges.add(edgeKey);
    }
    setCell(this.grid, r, c, word.text.charAt(charIndex));
    path.push({ r, c });

    const backtrack = () => {
      setCell(this.grid, r, c, '');
      path.pop();
      if (edgeKey) this.usedEdges.delete(edgeKey);
    };

    if (charIndex === word.text.length - 1) {
      // 剪枝 2：spangram 必须贯穿相对两边
      if (word.isSpangram && !pathTouchesOppositeEdges(path)) {
        backtrack();
        return false;
      }
      // 剪枝 4（方案A）：已铺的词必须各自保持唯一路径
      if (this.requireUniquePaths && !this.placedWordsStayUnique(wordIndex)) {
        backtrack();
        return false;
      }
      // 剪枝 3：后续词放不下则放弃
      if (wordIndex + 1 < this.words.length) {
        const restLengths = this.words.slice(wordIndex + 1).map((w) => w.text.length);
        if (!this.isValidEmptySpace(restLengths)) {
          backtrack();
          return false;
        }
      }
      if (await this.solve(wordIndex + 1)) return true;
      backtrack();
      return false;
    }

    for (const move of this.getValidMoves(r, c)) {
      if (await this.placeLetter(wordIndex, charIndex + 1, move.r, move.c, path, word)) return true;
    }
    backtrack();
    return false;
  }

  /**
   * Warnsdorff 启发：优先走"更拥挤"（八邻接空格数更少）的格子。
   *
   * @param {number} r
   * @param {number} c
   * @returns {{ r: number, c: number, emptyNeighbors: number }[]}
   */
  getValidMoves(r, c) {
    /** @type {{ r: number, c: number, emptyNeighbors: number }[]} */
    const moves = [];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= HEIGHT || nc < 0 || nc >= WIDTH) continue;
      if (cellAt(this.grid, nr, nc) !== '') continue;
      let emptyNeighbors = 0;
      for (const [dr2, dc2] of DIRS) {
        const ar = nr + dr2;
        const ac = nc + dc2;
        if (ar < 0 || ar >= HEIGHT || ac < 0 || ac >= WIDTH) continue;
        if (cellAt(this.grid, ar, ac) === '') emptyNeighbors++;
      }
      moves.push({ r: nr, c: nc, emptyNeighbors });
    }
    moves.sort((a, b) => a.emptyNeighbors - b.emptyNeighbors);
    return moves;
  }

  /**
   * 连通区域健康检查：对空格做 8 方向 flood-fill，任一区域放不下最短剩余词
   * 即为死路。
   *
   * @param {number[]} remainingLengths
   * @returns {boolean}
   */
  isValidEmptySpace(remainingLengths) {
    if (remainingLengths.length === 0) return true;
    const minLen = Math.min(...remainingLengths);
    const visited = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(false));
    for (let r = 0; r < HEIGHT; r++) {
      for (let c = 0; c < WIDTH; c++) {
        if (cellAt(this.grid, r, c) !== '' || defined(visited[r])[c]) continue;
        // flood-fill 统计该连通区域大小
        let size = 0;
        /** @type {[number, number][]} */
        const stack = [[r, c]];
        defined(visited[r])[c] = true;
        while (stack.length > 0) {
          const [cr, cc] = /** @type {[number, number]} */ (stack.pop());
          size++;
          for (const [dr, dc] of DIRS) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr < 0 || nr >= HEIGHT || nc < 0 || nc >= WIDTH) continue;
            if (cellAt(this.grid, nr, nc) !== '' || defined(visited[nr])[nc]) continue;
            defined(visited[nr])[nc] = true;
            stack.push([nr, nc]);
          }
        }
        if (size < minLen) return false;
      }
    }
    return true;
  }

  /**
   * 禁止对角线 X 交叉：a、b 恰为对角相邻时，另两格构成的交叉边已被占用则冲突。
   *
   * @param {StrandsPoint} a
   * @param {StrandsPoint} b
   * @returns {boolean}
   */
  isCrossingDiagonal(a, b) {
    if (Math.abs(a.r - b.r) === 1 && Math.abs(a.c - b.c) === 1) {
      const crossEdge = edgeKeyOf({ r: a.r, c: b.c }, { r: b.r, c: a.c });
      return this.usedEdges.has(crossEdge);
    }
    return false;
  }
}

/**
 * §4.5 validWords 收集：词典词统一大写并构建前缀集剪枝，网格上 8 方向 DFS
 * （深度 ≤ 15），收录 ≥4 字母、剔除 spangram 与主题词后的去重列表。
 *
 * @param {string[][]} grid
 * @param {string[]} dictWords 词典词（任意大小写）
 * @param {string[]} excludeWords spangram + 主题词
 * @returns {string[]}
 */
export function collectValidWords(grid, dictWords, excludeWords) {
  /** @type {Set<string>} */
  const validDict = new Set();
  /** @type {Set<string>} */
  const validPrefixes = new Set();
  for (const raw of dictWords) {
    const w = String(raw).toUpperCase();
    if (w.length < 4) continue;
    validDict.add(w);
    for (let i = 1; i <= w.length; i++) validPrefixes.add(w.slice(0, i));
  }
  for (const raw of excludeWords) {
    validDict.delete(String(raw).toUpperCase());
  }

  const rows = grid.length;
  const cols = defined(grid[0]).length;
  /** @type {Set<string>} */
  const found = new Set();
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  /**
   * @param {number} r
   * @param {number} c
   * @param {string} currentWord 已含 (r,c) 字母
   */
  function dfs(r, c, currentWord) {
    if (!validPrefixes.has(currentWord)) return;
    if (currentWord.length >= 4 && validDict.has(currentWord)) found.add(currentWord);
    if (currentWord.length >= 15) return;
    defined(visited[r])[c] = true;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (defined(visited[nr])[nc]) continue;
      dfs(nr, nc, currentWord + cellAt(grid, nr, nc));
    }
    defined(visited[r])[c] = false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, cellAt(grid, r, c));
    }
  }
  return [...found];
}

/**
 * §4.4 方案A 多路径消歧：统计一个词在网格中的可连几何路径数（达到 cap 即提前返回）。
 * 回文词（如 LEVEL）的同一条几何路径会被正反两个方向各搜到一次，
 * 通过"只计起点序号 < 终点序号"的规范方向来去重。
 *
 * @param {string} word 已大写的词
 * @param {string[][]} grid
 * @param {number} [cap] 计数上限，够判断唯一性即可（默认 2）
 * @param {{ edgeSpanOnly?: boolean, budget?: { count: number } }} [options]
 *   edgeSpanOnly：只计触达对边的路径——用于 spangram，因为引擎（evaluateSubmission）
 *     只接受触边的 spangram 路径，非触边路径不构成玩法歧义，不应计入唯一性；
 *   budget：若提供，每次 DFS 访问累加 budget.count，供调用方纳入迭代预算。
 * @returns {number}
 */
export function countWordPaths(word, grid, cap = 2, options = {}) {
  const { edgeSpanOnly = false, budget = null } = options;
  const rows = grid.length;
  const cols = defined(grid[0]).length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const isPalindrome = word === [...word].reverse().join('');
  let count = 0;

  /**
   * @param {number} r
   * @param {number} c
   * @param {number} index
   * @param {number} startKey 起点格序号（回文去重用）
   * @param {{ minR: number, maxR: number, minC: number, maxC: number }} box 路径边界框（触边判定用）
   */
  function walk(r, c, index, startKey, box) {
    if (budget) budget.count += 1;
    if (count >= cap) return;
    if (cellAt(grid, r, c) !== word[index]) return;
    if (defined(visited[r])[c]) return;
    box.minR = Math.min(box.minR, r);
    box.maxR = Math.max(box.maxR, r);
    box.minC = Math.min(box.minC, c);
    box.maxC = Math.max(box.maxC, c);
    if (index === word.length - 1) {
      const spansEdges =
        (box.minC === 0 && box.maxC === cols - 1) || (box.minR === 0 && box.maxR === rows - 1);
      if (edgeSpanOnly && !spansEdges) return;
      if (!isPalindrome || startKey < r * cols + c) count += 1;
      return;
    }
    defined(visited[r])[c] = true;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      walk(nr, nc, index + 1, startKey, { ...box });
    }
    defined(visited[r])[c] = false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      walk(r, c, 0, r * cols + c, { minR: r, maxR: r, minC: c, maxC: c });
      if (count >= cap) return count;
    }
  }
  return count;
}

/**
 * §4.4 方案A：要求 spangram 与全部主题词在网格中各自只有唯一可连路径。
 * 多路径会让玩家走"非官方路径"后锁死剩余词（实测随机游玩通关率可低至 ~53%），
 * NYT 官方谜题实际按唯一路径设计，这里在生成侧直接过滤。
 * spangram 只计触达对边的路径——非触边路径不会被引擎接受，不构成歧义。
 *
 * @param {string[][]} grid
 * @param {string} spangram
 * @param {string[]} words
 * @returns {boolean}
 */
export function hasUniqueWordPaths(grid, spangram, words) {
  if (countWordPaths(spangram, grid, 2, { edgeSpanOnly: true }) !== 1) return false;
  return words.every((word) => countWordPaths(word, grid, 2) === 1);
}
