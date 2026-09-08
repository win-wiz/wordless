"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  HINT_METER_MAX,
  evaluateSubmission,
  findPathForWord,
  isPracticeDate,
  pointKey,
  updateStrandsStats,
} from "@/lib/strands-engine";
import {
  EMPTY_STRANDS_STATS,
  STRANDS_STATS_KEY,
  readStrandsStats,
} from "@/lib/strands-stats";
import type {
  FoundWord,
  InteractionMode,
  SavedStrandsState,
  StrandsPoint,
  StrandsPuzzleData,
  StrandsStats,
} from "@/types/strands";

const ERROR_FLASH_MS = 600;
const TOAST_MS = 2000;
// 无日期作用域的旧版存档 key：非练习局每局都双写一份，作为读取回退
const UNSCOPED_SAVE_KEY = "strands_daily_game";

type Interaction = {
  mode: InteractionMode;
  path: StrandsPoint[];
};

function isAdjacent(a: StrandsPoint, b: StrandsPoint) {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
}

function samePoint(a: StrandsPoint | undefined, b: StrandsPoint) {
  return Boolean(a && a.r === b.r && a.c === b.c);
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i] as T;
    result[i] = result[j] as T;
    result[j] = a;
  }
  return result;
}

function storageKeyFor(date: string) {
  return `strands_daily_game_${date}`;
}

function loadSavedState(date: string, isPractice: boolean): SavedStrandsState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const keys = isPractice
    ? [storageKeyFor(date)]
    : [storageKeyFor(date), UNSCOPED_SAVE_KEY];

  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as SavedStrandsState;
      if (parsed && parsed.date === date && Array.isArray(parsed.foundWords)) {
        return parsed;
      }
    } catch {
      // 存档损坏时静默丢弃
    }
  }

  return null;
}

function readStats(): StrandsStats {
  return readStrandsStats() ?? { ...EMPTY_STRANDS_STATS };
}

export function useStrandsGame(puzzleData: StrandsPuzzleData) {
  const { date } = puzzleData;
  const { grid, spangram, words, validWords } = puzzleData.puzzle;
  const isPractice = isPracticeDate(date);

  const [initialSaved] = useState<SavedStrandsState | null>(() =>
    loadSavedState(date, isPractice),
  );

  const [foundWords, setFoundWords] = useState<FoundWord[]>(
    () => initialSaved?.foundWords ?? [],
  );
  const [hintMeter, setHintMeter] = useState(() => initialSaved?.hintMeter ?? 0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(
    () => initialSaved?.totalHintsUsed ?? 0,
  );
  const [scoreSubmitted, setScoreSubmitted] = useState(
    () => initialSaved?.scoreSubmitted ?? false,
  );
  const [hintCells, setHintCells] = useState<StrandsPoint[]>(
    () => initialSaved?.hintCells ?? [],
  );
  const [chargedWords, setChargedWords] = useState<string[]>(
    () => initialSaved?.chargedWords ?? [],
  );
  const [justWon, setJustWon] = useState(false);
  const [errorPath, setErrorPath] = useState<StrandsPoint[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [interaction, setInteraction] = useState<Interaction>({
    mode: "idle",
    path: [],
  });

  const interactionRef = useRef(interaction);
  interactionRef.current = interaction;
  const errorTimerRef = useRef<number | null>(null);
  const messageTimerRef = useRef<number | null>(null);

  const isWon = foundWords.length === words.length + 1;
  const isSpangramFound = useMemo(
    () => foundWords.some((fw) => fw.isSpangram),
    [foundWords],
  );

  const occupiedCells = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const fw of foundWords) {
      for (const point of fw.path) {
        map.set(pointKey(point), fw.isSpangram);
      }
    }
    return map;
  }, [foundWords]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // §2.4 持久化：进度/能量/充能词/提示高亮全部落盘；justWon/errorPath/message 瞬态不落盘
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }

    const saved: SavedStrandsState = {
      date,
      foundWords,
      hintMeter,
      totalHintsUsed,
      scoreSubmitted,
      chargedWords,
      hintCells,
    };

    try {
      if (isPractice) {
        for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
          const key = window.localStorage.key(i);
          if (
            key &&
            key.startsWith(`${UNSCOPED_SAVE_KEY}_practice_`) &&
            key !== storageKeyFor(date)
          ) {
            window.localStorage.removeItem(key);
          }
        }
        window.localStorage.setItem(storageKeyFor(date), JSON.stringify(saved));
      } else {
        const serialized = JSON.stringify(saved);
        window.localStorage.setItem(storageKeyFor(date), serialized);
        window.localStorage.setItem(UNSCOPED_SAVE_KEY, serialized);
      }
    } catch {
      // 存储不可用时静默跳过
    }
  }, [
    isLoaded,
    isPractice,
    date,
    foundWords,
    hintMeter,
    totalHintsUsed,
    scoreSubmitted,
    chargedWords,
    hintCells,
  ]);

  useEffect(
    () => () => {
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
      }
      if (messageTimerRef.current !== null) {
        window.clearTimeout(messageTimerRef.current);
      }
    },
    [],
  );

  const showMessage = useCallback((text: string) => {
    if (messageTimerRef.current !== null) {
      window.clearTimeout(messageTimerRef.current);
    }
    setMessage(text);
    messageTimerRef.current = window.setTimeout(() => {
      setMessage(null);
      messageTimerRef.current = null;
    }, TOAST_MS);
  }, []);

  const flashError = useCallback((path: StrandsPoint[]) => {
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
    }
    setErrorPath(path);
    errorTimerRef.current = window.setTimeout(() => {
      setErrorPath([]);
      setInteraction({ mode: "idle", path: [] });
      errorTimerRef.current = null;
    }, ERROR_FLASH_MS);
  }, []);

  const reportScore = useCallback(
    (hintsUsed: number) => {
      // fire-and-forget：失败静默
      void fetch("/api/strands/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          puzzleId: puzzleData.puzzle.id,
          hintsUsed,
          completed: true,
        }),
      }).catch(() => undefined);
    },
    [date, puzzleData.puzzle.id],
  );

  const submitPath = useCallback(
    (path: StrandsPoint[]) => {
      if (path.length === 0) {
        setInteraction({ mode: "idle", path: [] });
        return;
      }

      const result = evaluateSubmission({
        path,
        grid,
        spangram,
        words,
        validWords,
        foundWords,
        chargedWords,
      });

      switch (result.kind) {
        case "found": {
          const foundWord: FoundWord = {
            word: result.canonicalWord ?? "",
            path,
            isSpangram: Boolean(result.isSpangram),
          };
          const nextFoundWords = [...foundWords, foundWord];
          setFoundWords(nextFoundWords);

          const hitHintCell = path.some((point) =>
            hintCells.some((hint) => hint.r === point.r && hint.c === point.c),
          );
          if (hitHintCell) {
            setHintCells([]);
          }

          setInteraction({ mode: "idle", path: [] });

          if (nextFoundWords.length === words.length + 1) {
            setJustWon(true);
            setScoreSubmitted(true);
            try {
              const updated = updateStrandsStats(
                readStats(),
                date,
                true,
                totalHintsUsed,
              );
              window.localStorage.setItem(STRANDS_STATS_KEY, JSON.stringify(updated));
            } catch {
              // 统计写入失败静默
            }
            if (!isPractice) {
              reportScore(totalHintsUsed);
            }
          }
          break;
        }
        case "charged": {
          showMessage(result.message ?? "Good word!");
          setHintMeter((meter) => Math.min(HINT_METER_MAX, meter + 1));
          // 引擎 charged 分支不回传 canonicalWord（§3.3 分支 4 仅正向匹配），
          // 直接从路径拼出该词记入 chargedWords，保证同一词只充能一次
          const chargedWord =
            result.canonicalWord ??
            path.map((point) => grid[point.r]?.[point.c] ?? "").join("");
          if (chargedWord) {
            setChargedWords((prev) =>
              prev.includes(chargedWord) ? prev : [...prev, chargedWord],
            );
          }
          setInteraction({ mode: "idle", path: [] });
          break;
        }
        case "alreadyCounted": {
          showMessage(result.message ?? "Already counted");
          setInteraction({ mode: "idle", path: [] });
          break;
        }
        case "alreadyFound":
        case "spangramNoEdge":
        case "tooShort":
        case "notInList": {
          // 这四个分支引擎必定携带 message（§3.3 判定树）
          if (result.message) {
            showMessage(result.message);
          }
          flashError(path);
          break;
        }
      }
    },
    [
      chargedWords,
      date,
      flashError,
      foundWords,
      grid,
      hintCells,
      isPractice,
      reportScore,
      showMessage,
      spangram,
      totalHintsUsed,
      validWords,
      words,
    ],
  );

  const useHint = useCallback(() => {
    if (hintMeter < HINT_METER_MAX) {
      return;
    }

    const candidates = shuffle(
      [...words, spangram].filter(
        (word) => !foundWords.some((fw) => fw.word === word),
      ),
    );
    const blocked = new Set<string>();
    for (const fw of foundWords) {
      for (const point of fw.path) {
        blocked.add(pointKey(point));
      }
    }

    for (const target of candidates) {
      const path = findPathForWord(target, grid, blocked);
      if (path && path.length > 0) {
        setHintMeter(0);
        setTotalHintsUsed((count) => count + 1);
        setHintCells(path);
        return;
      }
    }

    showMessage("No hint available");
  }, [foundWords, grid, hintMeter, showMessage, spangram, words]);

  const removeFoundWord = useCallback(
    (word: string) => {
      if (isWon) {
        return;
      }
      setFoundWords((prev) => prev.filter((fw) => fw.word !== word));
      // 防御性重置（规则 10：正常 UI 流程下不可达）
      setScoreSubmitted(false);
      setJustWon(false);
    },
    [isWon],
  );

  // §3.2 交互状态机
  const handleCellPointerDown = useCallback(
    (r: number, c: number) => {
      const target: StrandsPoint = { r, c };
      if (occupiedCells.has(pointKey(target))) {
        return;
      }

      const { mode, path } = interactionRef.current;

      if (mode === "clicking") {
        const last = path[path.length - 1];
        if (last && samePoint(last, target)) {
          submitPath(path);
          return;
        }
        const previous = path[path.length - 2];
        if (samePoint(previous, target)) {
          setInteraction({ mode: "clicking", path: path.slice(0, -1) });
          return;
        }
        if (
          last &&
          isAdjacent(last, target) &&
          !path.some((point) => samePoint(point, target))
        ) {
          setInteraction({ mode: "clicking", path: [...path, target] });
          return;
        }
        setInteraction({ mode: "dragging", path: [target] });
        return;
      }

      setInteraction({ mode: "dragging", path: [target] });
    },
    [occupiedCells, submitPath],
  );

  const handlePointerMove = useCallback(
    (event: { clientX: number; clientY: number; buttons: number }) => {
      // 门控：纯 hover（未按键）不得连词
      if (event.buttons === 0) {
        return;
      }

      const { mode, path } = interactionRef.current;
      if (mode === "idle") {
        return;
      }

      const element = document.elementFromPoint(event.clientX, event.clientY);
      const cell = element?.closest("[data-strands-cell]");
      if (!cell) {
        return;
      }

      const r = Number(cell.getAttribute("data-row"));
      const c = Number(cell.getAttribute("data-col"));
      if (!Number.isInteger(r) || !Number.isInteger(c)) {
        return;
      }

      const target: StrandsPoint = { r, c };
      if (occupiedCells.has(pointKey(target))) {
        return;
      }

      const last = path[path.length - 1];
      const previous = path[path.length - 2];

      if (samePoint(previous, target)) {
        setInteraction({ mode: "dragging", path: path.slice(0, -1) });
        return;
      }
      if (path.some((point) => samePoint(point, target))) {
        return;
      }
      if (last && isAdjacent(last, target)) {
        setInteraction({ mode: "dragging", path: [...path, target] });
        return;
      }
      // §3.2 点住转拖拽：clicking 模式按住移动到非邻接格时，先切到 dragging，
      // 使后续邻接格能继续追加，松手时路径长度 > 1 可正常提交
      if (mode === "clicking") {
        setInteraction({ mode: "dragging", path });
      }
    },
    [occupiedCells],
  );

  const handlePointerUp = useCallback(() => {
    const { mode, path } = interactionRef.current;
    if (mode !== "dragging") {
      return;
    }
    if (path.length === 1) {
      setInteraction({ mode: "clicking", path });
    } else if (path.length > 1) {
      submitPath(path);
    } else {
      setInteraction({ mode: "idle", path: [] });
    }
  }, [submitPath]);

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerUp]);

  return {
    grid,
    date,
    isPractice,
    isLoaded,
    isWon,
    isSpangramFound,
    foundWords,
    hintMeter,
    totalHintsUsed,
    scoreSubmitted,
    hintCells,
    chargedWords,
    justWon,
    errorPath,
    message,
    currentPath: interaction.path,
    interactionMode: interaction.mode,
    occupiedCells,
    handleCellPointerDown,
    handlePointerMove,
    handlePointerUp,
    useHint,
    removeFoundWord,
  };
}

export type UseStrandsGameReturn = ReturnType<typeof useStrandsGame>;
