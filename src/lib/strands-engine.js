/**
 * Strands 游戏纯逻辑引擎（运行时部分）。
 *
 * 实现 doc/strands-game-design.md 中的规则契约：SVG 路径（§3.5）、提示回溯
 * 找路（§3.4）、提交判定树（§3.3）、统计（§2.4）与分享文案（§3.7）。
 * 生成期逻辑（§4.3 组合筛选、§4.4 铺网、§4.5 validWords 收集）在
 * strands-grid-solver.js，不进客户端 bundle。
 * 本模块不依赖 React / DOM / 环境变量，可同时被前端与 node 脚本使用。
 */

export const WIDTH = 6;
export const HEIGHT = 8;
export const TOTAL_CELLS = 48;

/** §2.4 提示能量槽上限：充满 3 格可用一次提示。 */
export const HINT_METER_MAX = 3;

/**
 * 8 方向 [dr, dc]，顺序与规格 §4.4 一致。
 * @type {[number, number][]}
 */
export const DIRS = [
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
];

/**
 * @typedef {{ r: number, c: number }} StrandsPoint
 */

/**
 * @typedef {{ word: string, path: StrandsPoint[], isSpangram: boolean }} StrandsFoundWord
 */

/**
 * @typedef {{
 *   played: number,
 *   won: number,
 *   currentStreak: number,
 *   maxStreak: number,
 *   perfectGames: number,
 *   lastPlayedDate?: string,
 *   lastWonDate?: string,
 * }} StrandsStats
 */

/**
 * @typedef {'found' | 'alreadyFound' | 'spangramNoEdge' | 'charged' | 'alreadyCounted' | 'tooShort' | 'notInList'} StrandsSubmissionKind
 */

/**
 * @typedef {{
 *   kind: StrandsSubmissionKind,
 *   canonicalWord?: string,
 *   isSpangram?: boolean,
 *   message?: string,
 * }} StrandsSubmissionResult
 */

/**
 * 收窄 noUncheckedIndexedAccess 的下标读取结果。仅在调用方已由逻辑（循环边界、
 * 长度检查）保证下标界内时使用，等价于 TS 的非空断言。
 *
 * @template T
 * @param {T | undefined} value
 * @returns {T}
 */
export const defined = (value) => /** @type {T} */ (value);

/**
 * @param {StrandsPoint} point
 * @returns {string} 'r,c'
 */
export function pointKey(point) {
  return `${point.r},${point.c}`;
}

/**
 * 练习局日期形如 'practice_<epochMillis>'。
 *
 * @param {string} date
 * @returns {boolean}
 */
export function isPracticeDate(date) {
  return date.startsWith('practice_');
}

/**
 * 读取格子字母（调用方保证 r/c 在界内）。
 *
 * @param {string[][]} grid
 * @param {number} r
 * @param {number} c
 * @returns {string}
 */
export const cellAt = (grid, r, c) => defined(defined(grid[r])[c]);

/**
 * 写入格子字母（调用方保证 r/c 在界内）。
 *
 * @param {string[][]} grid
 * @param {number} r
 * @param {number} c
 * @param {string} ch
 */
export const setCell = (grid, r, c, ch) => {
  defined(grid[r])[c] = ch;
};

/** @param {number} n */
const fmt = (n) => Number(n.toFixed(2));

/**
 * §3.5 SVG 平滑路径。viewBox 固定 0 0 600 800，格中心 = 格坐标 * 100 + 50。
 *
 * @param {StrandsPoint[]} points
 * @returns {string} SVG path d 字符串
 */
export function getSmoothPath(points) {
  if (!points || points.length === 0) return '';
  const coords = points.map((p) => ({ x: p.c * 100 + 50, y: p.r * 100 + 50 }));
  /**
   * 读取第 i 个坐标点（调用方保证 i 在界内）。
   * @param {number} i
   */
  const at = (i) => defined(coords[i]);
  if (coords.length === 1) {
    return `M ${fmt(at(0).x)} ${fmt(at(0).y)} L ${fmt(at(0).x)} ${fmt(at(0).y)}`;
  }
  if (coords.length === 2) {
    return `M ${fmt(at(0).x)} ${fmt(at(0).y)} L ${fmt(at(1).x)} ${fmt(at(1).y)}`;
  }
  const radius = 0.3;
  let d = `M ${fmt(at(0).x)} ${fmt(at(0).y)}`;
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = at(i - 1);
    const curr = at(i);
    const next = at(i + 1);
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const cross = v1x * v2y - v1y * v2x;
    if (Math.abs(cross) < 0.01) {
      d += ` L ${fmt(curr.x)} ${fmt(curr.y)}`;
    } else {
      const p1 = { x: curr.x - v1x * radius, y: curr.y - v1y * radius };
      const p2 = { x: curr.x + v2x * radius, y: curr.y + v2y * radius };
      d += ` L ${fmt(p1.x)} ${fmt(p1.y)} Q ${fmt(curr.x)} ${fmt(curr.y)}, ${fmt(p2.x)} ${fmt(p2.y)}`;
    }
  }
  const last = at(coords.length - 1);
  d += ` L ${fmt(last.x)} ${fmt(last.y)}`;
  return d;
}

/**
 * @param {number} r
 * @param {number} c
 * @returns {string} 'r,c'
 */
const cellKey = (r, c) => `${r},${c}`;

/**
 * §3.4 在网格中回溯找出 word 的一条可行路径。blocked 格子不可通过；
 * 正向失败时对反转串重试。返回首个成功的路径，找不到返回 null。
 *
 * @param {string} word
 * @param {string[][]} grid 8x6 大写字母网格
 * @param {Set<string>} blocked 'r,c' 集合
 * @returns {StrandsPoint[] | null}
 */
export function findPathForWord(word, grid, blocked) {
  const target = word.toUpperCase();
  return search(target) || search([...target].reverse().join(''));

  /**
   * @param {string} t
   * @returns {StrandsPoint[] | null}
   */
  function search(t) {
    for (let r = 0; r < HEIGHT; r++) {
      for (let c = 0; c < WIDTH; c++) {
        if (cellAt(grid, r, c) !== t.charAt(0) || blocked.has(cellKey(r, c))) continue;
        const visited = new Set([cellKey(r, c)]);
        const path = [{ r, c }];
        const result = dfs(r, c, 1, t, visited, path);
        if (result) return result;
      }
    }
    return null;
  }

  /**
   * @param {number} r
   * @param {number} c
   * @param {number} index 下一个要匹配的字符下标
   * @param {string} t
   * @param {Set<string>} visited
   * @param {StrandsPoint[]} path
   * @returns {StrandsPoint[] | null}
   */
  function dfs(r, c, index, t, visited, path) {
    if (index === t.length) return path.map((p) => ({ r: p.r, c: p.c }));
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= HEIGHT || nc < 0 || nc >= WIDTH) continue;
      const key = cellKey(nr, nc);
      if (visited.has(key) || blocked.has(key)) continue;
      if (cellAt(grid, nr, nc) !== t.charAt(index)) continue;
      visited.add(key);
      path.push({ r: nr, c: nc });
      const result = dfs(nr, nc, index + 1, t, visited, path);
      if (result) return result;
      path.pop();
      visited.delete(key);
    }
    return null;
  }
}

/**
 * §3.3 判定辅助：路径是否触达相对两边（c=0 且 c=5，或 r=0 且 r=7）。
 *
 * @param {StrandsPoint[]} path
 * @returns {boolean}
 */
export function pathTouchesOppositeEdges(path) {
  let minR = Infinity;
  let maxR = -Infinity;
  let minC = Infinity;
  let maxC = -Infinity;
  for (const p of path) {
    if (p.r < minR) minR = p.r;
    if (p.r > maxR) maxR = p.r;
    if (p.c < minC) minC = p.c;
    if (p.c > maxC) maxC = p.c;
  }
  return (minC === 0 && maxC === WIDTH - 1) || (minR === 0 && maxR === HEIGHT - 1);
}

/**
 * §3.3 单词校验决策树。
 *
 * ⚠️ 保持不对称：主题词 / spangram 判定接受反转，validWords 充能分支只匹配
 * 正向（规格 §3.3 明确勿修）。
 *
 * @param {{
 *   path: StrandsPoint[],
 *   grid: string[][],
 *   spangram: string,
 *   words: string[],
 *   validWords: string[],
 *   foundWords: StrandsFoundWord[],
 *   chargedWords: string[],
 * }} input
 * @returns {StrandsSubmissionResult}
 */
export function evaluateSubmission({ path, grid, spangram, words, validWords, foundWords, chargedWords }) {
  const word = path.map((p) => cellAt(grid, p.r, p.c)).join('');
  const rev = [...word].reverse().join('');

  const isThemeWord = words.includes(word) || words.includes(rev);
  const actualSpangram = spangram === word || spangram === rev;
  const canonicalWord = actualSpangram
    ? spangram
    : words.includes(rev) && !words.includes(word)
      ? rev
      : word;
  const isAlreadyFound = foundWords.some((fw) => fw.word === canonicalWord);
  const isSpangramValid = actualSpangram ? pathTouchesOppositeEdges(path) : false;

  if ((isThemeWord || (actualSpangram && isSpangramValid)) && !isAlreadyFound) {
    return { kind: 'found', canonicalWord, isSpangram: actualSpangram };
  }
  if (isAlreadyFound) {
    return { kind: 'alreadyFound', canonicalWord, message: 'Already found' };
  }
  if (actualSpangram && !isSpangramValid) {
    return { kind: 'spangramNoEdge', canonicalWord: spangram, message: 'Spangram must touch opposite edges' };
  }
  if (!actualSpangram && validWords.includes(word)) {
    if (chargedWords.includes(word)) {
      return { kind: 'alreadyCounted', message: 'Already counted' };
    }
    return { kind: 'charged', canonicalWord: word, message: 'Good word!' };
  }
  if (word.length < 4) {
    return { kind: 'tooShort', message: 'Too short' };
  }
  return { kind: 'notInList', message: 'Not in word list' };
}

/**
 * @param {string} date 'YYYY-MM-DD'
 * @returns {number} UTC 毫秒时间戳
 */
const utcDay = (date) =>
  Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));

/**
 * §2.4 长期统计更新。practice_ 前缀与同日均直接返回原 stats；
 * 连胜按 lastWonDate 的 UTC 日期差恰好 1 天计算。
 *
 * @param {StrandsStats} stats
 * @param {string} date 'YYYY-MM-DD' 或 'practice_<millis>'
 * @param {boolean} isWon
 * @param {number} hintsUsed
 * @returns {StrandsStats}
 */
export function updateStrandsStats(stats, date, isWon, hintsUsed) {
  if (isPracticeDate(date)) return stats;
  if (stats.lastPlayedDate === date) return stats;

  stats.played += 1;
  stats.lastPlayedDate = date;

  if (isWon) {
    stats.won += 1;
    if (hintsUsed === 0) stats.perfectGames += 1;
    const DAY_MS = 24 * 60 * 60 * 1000;
    const prev = stats.lastWonDate ? utcDay(stats.lastWonDate) : null;
    const cur = utcDay(date);
    if (prev !== null && (cur - prev) / DAY_MS === 1) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.lastWonDate = date;
  } else {
    stats.currentStreak = 0;
  }
  return stats;
}

/**
 * §3.7 分享文案。emoji 行为硬编码占位（规格明确勿动态映射）。
 *
 * @param {{ theme: string, hintsUsed: number, isPractice: boolean, url: string }} input
 * @returns {string}
 */
export function buildShareText({ theme, hintsUsed, isPractice, url }) {
  const hints = hintsUsed === 0 ? 'None' : String(hintsUsed);
  return `Strands${isPractice ? ' (Practice)' : ''}\n${theme}\nHints used: ${hints}\n💡💡🔵🟡🔵\nPlay at: ${url}`;
}
