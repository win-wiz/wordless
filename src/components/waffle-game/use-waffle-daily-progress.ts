"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { restoreProgressFromResponse } from "@/components/waffle-game/waffle-client-helpers";
import type {
  WaffleApiResponse,
  WaffleMode,
} from "@/components/waffle-game/waffle-client-types";
import {
  fetchWaffleDailyProgress,
  saveWaffleDailyProgress,
} from "@/lib/api";
import type {
  WaffleDailyCommunityStats,
  WaffleDailyStats,
} from "@/types/waffle";

type UseWaffleDailyProgressParams = {
  currentLetters: string[];
  isShowingSolution: boolean;
  mode: WaffleMode;
  puzzle: WaffleApiResponse | null;
  setCurrentLetters: Dispatch<SetStateAction<string[]>>;
  setIsShowingSolution: Dispatch<SetStateAction<boolean>>;
  setSwapsUsed: Dispatch<SetStateAction<number>>;
  solved: boolean;
  swapsUsed: number;
};

type QueuePersistProgressInput = {
  currentLetters: string[];
  delayMs?: number;
  revealed: boolean;
  swapsUsed: number;
  totalTime?: number;
};

export function useWaffleDailyProgress({
  currentLetters,
  isShowingSolution,
  mode,
  puzzle,
  setCurrentLetters,
  setIsShowingSolution,
  setSwapsUsed,
  solved,
  swapsUsed,
}: UseWaffleDailyProgressParams) {
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [savedRecordExists, setSavedRecordExists] = useState(false);
  const [dailyStats, setDailyStats] = useState<WaffleDailyStats | null>(null);
  const [communityStats, setCommunityStats] = useState<WaffleDailyCommunityStats | null>(null);

  const pendingProgressSaveRef = useRef<number | null>(null);
  const progressRestoredRef = useRef(false);
  const progressLoadedRef = useRef(false);
  const suppressAutoResultPromptRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const elapsedTimeRef = useRef(0);
  const elapsedStartedAtRef = useRef<number | null>(null);
  const latestStateRef = useRef({
    currentLetters: [] as string[],
    isShowingSolution: false,
    mode: "daily" as WaffleMode,
    puzzle: null as WaffleApiResponse | null,
    solved: false,
    swapsUsed: 0,
  });

  const clearPendingProgressSave = useCallback(() => {
    if (pendingProgressSaveRef.current !== null) {
      window.clearTimeout(pendingProgressSaveRef.current);
      pendingProgressSaveRef.current = null;
    }
  }, []);

  const syncElapsedTime = useCallback(() => {
    const startedAt = elapsedStartedAtRef.current;

    if (startedAt === null) {
      return elapsedTimeRef.current;
    }

    const delta = Math.floor((Date.now() - startedAt) / 1000);

    if (delta > 0) {
      elapsedTimeRef.current += delta;
      elapsedStartedAtRef.current = startedAt + delta * 1000;
    }

    return elapsedTimeRef.current;
  }, []);

  const getElapsedTime = useCallback(() => syncElapsedTime(), [syncElapsedTime]);

  const resetDailyProgressState = useCallback(() => {
    clearPendingProgressSave();
    setProgressLoaded(false);
    setSavedRecordExists(false);
    setDailyStats(null);
    setCommunityStats(null);
    progressRestoredRef.current = false;
    progressLoadedRef.current = false;
    suppressAutoResultPromptRef.current = false;
    lastSavedSnapshotRef.current = null;
    elapsedTimeRef.current = 0;
    elapsedStartedAtRef.current = null;
  }, [clearPendingProgressSave]);

  useEffect(() => () => clearPendingProgressSave(), [clearPendingProgressSave]);

  useEffect(() => {
    latestStateRef.current = {
      currentLetters,
      isShowingSolution,
      mode,
      puzzle,
      solved,
      swapsUsed,
    };
  }, [currentLetters, isShowingSolution, mode, puzzle, solved, swapsUsed]);

  const persistDailyProgress = useCallback(
    async ({
      currentLetters: letters,
      revealed,
      swapsUsed: nextSwapsUsed,
      totalTime,
    }: QueuePersistProgressInput) => {
      const activePuzzle = latestStateRef.current.puzzle;

      if (latestStateRef.current.mode !== "daily" || !activePuzzle || !progressLoadedRef.current) {
        return;
      }

      const resolvedTotalTime = totalTime ?? getElapsedTime();
      const snapshotKey = JSON.stringify({
        letters,
        revealed,
        swapsUsed: nextSwapsUsed,
        totalTime: resolvedTotalTime,
      });

      if (snapshotKey === lastSavedSnapshotRef.current) {
        return;
      }

      try {
        const progress = await saveWaffleDailyProgress({
          challengeDate: activePuzzle.date ?? "",
          currentLetters: letters,
          maxSwaps: activePuzzle.maxSwaps,
          revealed,
          swapsUsed: nextSwapsUsed,
          totalTime: resolvedTotalTime,
        });

        lastSavedSnapshotRef.current = snapshotKey;
        setDailyStats(progress.stats);
        setCommunityStats(progress.communityStats);
        setSavedRecordExists(Boolean(progress.record));
      } catch (error) {
        console.error("save waffle progress error:", error);
      }
    },
    [getElapsedTime],
  );

  const queuePersistDailyProgress = useCallback(
    ({ currentLetters: letters, delayMs = 450, revealed, swapsUsed: nextSwapsUsed, totalTime }: QueuePersistProgressInput) => {
      clearPendingProgressSave();

      pendingProgressSaveRef.current = window.setTimeout(() => {
        pendingProgressSaveRef.current = null;
        void persistDailyProgress({
          currentLetters: letters,
          revealed,
          swapsUsed: nextSwapsUsed,
          totalTime,
        });
      }, delayMs);
    },
    [clearPendingProgressSave, persistDailyProgress],
  );

  useEffect(() => {
    const activePuzzle = puzzle;

    if (mode !== "daily" || !activePuzzle || !activePuzzle.date) {
      setProgressLoaded(true);
      progressLoadedRef.current = true;
      return;
    }

    let cancelled = false;

    async function loadProgress(activeDailyPuzzle: WaffleApiResponse) {
      try {
        const progress = await fetchWaffleDailyProgress(activeDailyPuzzle.date ?? undefined);

        if (cancelled) {
          return;
        }

        const restoredState = restoreProgressFromResponse(progress, activeDailyPuzzle);
        setDailyStats(progress.stats);
        setCommunityStats(progress.communityStats);

        if (restoredState) {
          progressRestoredRef.current = true;
          suppressAutoResultPromptRef.current = restoredState.completed;
          setCurrentLetters(restoredState.currentLetters);
          setSwapsUsed(restoredState.swapsUsed);
          elapsedTimeRef.current = restoredState.totalTime;
          setIsShowingSolution(restoredState.revealed);
          setSavedRecordExists(restoredState.completed);
          lastSavedSnapshotRef.current = JSON.stringify({
            letters: restoredState.currentLetters,
            revealed: restoredState.revealed,
            swapsUsed: restoredState.swapsUsed,
            totalTime: restoredState.totalTime,
          });
        } else {
          progressRestoredRef.current = true;
          suppressAutoResultPromptRef.current = Boolean(progress.record);
          setSavedRecordExists(Boolean(progress.record));
        }
      } catch (progressError) {
        if (!cancelled) {
          console.error("load waffle progress error:", progressError);
        }
      } finally {
        if (!cancelled) {
          setProgressLoaded(true);
          progressLoadedRef.current = true;
        }
      }
    }

    void loadProgress(activePuzzle);

    return () => {
      cancelled = true;
    };
  }, [mode, puzzle, setCurrentLetters, setIsShowingSolution, setSwapsUsed]);

  useEffect(() => {
    if (mode !== "daily" || !puzzle || !progressLoaded || solved || isShowingSolution) {
      syncElapsedTime();
      elapsedStartedAtRef.current = null;
      return;
    }

    if (elapsedStartedAtRef.current === null) {
      elapsedStartedAtRef.current = Date.now();
    }

    const intervalId = window.setInterval(() => {
      syncElapsedTime();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isShowingSolution, mode, progressLoaded, puzzle, solved, syncElapsedTime]);

  useEffect(() => {
    if (mode !== "daily" || !puzzle || !progressLoaded || !progressRestoredRef.current || !puzzle.date) {
      return;
    }

    const flushProgress = () => {
      const latestState = latestStateRef.current;

      if (
        latestState.mode !== "daily" ||
        !latestState.puzzle ||
        !progressLoadedRef.current ||
        !progressRestoredRef.current ||
        !latestState.puzzle.date
      ) {
        return;
      }

        clearPendingProgressSave();
      void persistDailyProgress({
        currentLetters: latestState.currentLetters,
        revealed: latestState.isShowingSolution,
        swapsUsed: latestState.swapsUsed,
        totalTime: getElapsedTime(),
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushProgress();
      }
    };

    window.addEventListener("pagehide", flushProgress);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushProgress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    }, [clearPendingProgressSave, getElapsedTime, mode, persistDailyProgress, progressLoaded, puzzle]);

  return {
    communityStats,
    dailyStats,
    getElapsedTime,
    progressLoaded,
    queuePersistDailyProgress,
    resetDailyProgressState,
    savedRecordExists,
    setSavedRecordExists,
    suppressAutoResultPromptRef,
  };
}
