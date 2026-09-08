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
 * 组合（主题词 4–8 个），最多 maxResults 个，返回前随机打乱。
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

  // 最后随机打乱（Fisher-Yates）
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = defined(results[i]);
    const b = defined(results[j]);
    results[i] = b;
    results[j] = a;
  }
  return results;
}

const MAX_ITERATIONS = 200000;

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
   */
  constructor(words) {
    this.words = [...words].sort((a, b) => {
      if (a.isSpangram !== b.isSpangram) return a.isSpangram ? -1 : 1;
      return b.text.length - a.text.length;
    });
    /** @type {string[][]} */
    this.grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(''));
    /** @type {Set<string>} */
    this.usedEdges = new Set();
    this.iterations = 0;
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
