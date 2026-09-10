"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

import { getChangedIndices } from "@/components/waffle-game/waffle-client-helpers";
import type {
  SwapAnimation,
  WaffleApiResponse,
  WaffleMode,
  WaffleMoveSnapshot,
} from "@/components/waffle-game/waffle-client-types";
import type { WaffleTileState } from "@/lib/waffle-game";
import { isWaffleSolved, swapWaffleLetters } from "@/lib/waffle-game";

const SWAP_ANIMATION_MS = 260;
const TILE_FLASH_MS = 520;

type PersistDailyProgress = (input: {
  currentLetters: string[];
  delayMs?: number;
  revealed: boolean;
  swapsUsed: number;
  totalTime?: number;
}) => void;

type UseWaffleBoardControllerParams = {
  currentLetters: string[];
  isShowingSolution: boolean;
  loading: boolean;
  mode: WaffleMode;
  onInvalidateResult: () => void;
  puzzle: WaffleApiResponse | null;
  queuePersistDailyProgress: PersistDailyProgress;
  setCurrentLetters: Dispatch<SetStateAction<string[]>>;
  setIsShowingSolution: Dispatch<SetStateAction<boolean>>;
  setSavedRecordExists: Dispatch<SetStateAction<boolean>>;
  setSwapsUsed: Dispatch<SetStateAction<number>>;
  solved: boolean;
  swapsUsed: number;
  tileStates: WaffleTileState[];
};

type UseWaffleBoardControllerResult = {
  boardRef: MutableRefObject<HTMLDivElement | null>;
  canInteractWithTiles: boolean;
  canReset: boolean;
  canUndo: boolean;
  changedTileIndices: number[];
  handleReset: () => void;
  handleTileClick: (index: number) => void;
  handleUndo: () => void;
  hiddenSwapIndices: Set<number>;
  resetBoardState: () => void;
  selectedIndex: number | null;
  swapAnimation: SwapAnimation | null;
  tileRefs: MutableRefObject<Record<number, HTMLButtonElement | null>>;
};

export function useWaffleBoardController({
  currentLetters,
  isShowingSolution,
  loading,
  mode,
  onInvalidateResult,
  puzzle,
  queuePersistDailyProgress,
  setCurrentLetters,
  setIsShowingSolution,
  setSavedRecordExists,
  setSwapsUsed,
  solved,
  swapsUsed,
  tileStates,
}: UseWaffleBoardControllerParams): UseWaffleBoardControllerResult {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<WaffleMoveSnapshot[]>([]);
  const [changedTileIndices, setChangedTileIndices] = useState<number[]>([]);
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const timeoutIdsRef = useRef<number[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutIdsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback(
    (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        timeoutIdsRef.current = timeoutIdsRef.current.filter((entry) => entry !== timeoutId);
        callback();
      }, delay);

      timeoutIdsRef.current.push(timeoutId);
      return timeoutId;
    },
    [],
  );

  const flashTiles = useCallback(
    (indices: number[]) => {
      if (indices.length === 0) {
        return;
      }

      setChangedTileIndices(indices);
      scheduleTimeout(() => setChangedTileIndices([]), TILE_FLASH_MS);
    },
    [scheduleTimeout],
  );

  const resetBoardState = useCallback(() => {
    clearTimeouts();
    setSelectedIndex(null);
    setMoveHistory([]);
    setChangedTileIndices([]);
    setSwapAnimation(null);
  }, [clearTimeouts]);

  useEffect(() => () => clearTimeouts(), [clearTimeouts]);

  const interactionLocked = loading || !puzzle || Boolean(swapAnimation);
  const canInteractWithTiles = !interactionLocked && !isShowingSolution && !solved;
  const canUndo = moveHistory.length > 0 && !interactionLocked && !isShowingSolution && !solved;
  const hasBoardChanges = useMemo(() => {
    if (!puzzle) {
      return false;
    }

    return currentLetters.some((letter, index) => letter !== puzzle.initialLetters[index]);
  }, [currentLetters, puzzle]);
  const canReset = Boolean(
    puzzle &&
      mode === "unlimited" &&
      !interactionLocked &&
      (swapsUsed > 0 || hasBoardChanges),
  );

  const hiddenSwapIndices = useMemo(() => {
    if (!swapAnimation) {
      return new Set<number>();
    }

    return new Set<number>([swapAnimation.fromIndex, swapAnimation.toIndex]);
  }, [swapAnimation]);

  const commitSwap = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!puzzle) {
        return;
      }

      const previousLetters = [...currentLetters];
      const nextLetters = swapWaffleLetters(previousLetters, fromIndex, toIndex);
      const nextSwapsUsed = swapsUsed + 1;

      setMoveHistory((previousHistory) => [
        ...previousHistory,
        {
          letters: previousLetters,
          swapsUsed,
        },
      ]);
      setCurrentLetters(nextLetters);
      setSwapsUsed(nextSwapsUsed);
      flashTiles(getChangedIndices(previousLetters, nextLetters, [fromIndex, toIndex]));
      queuePersistDailyProgress({
        currentLetters: nextLetters,
        revealed: false,
        swapsUsed: nextSwapsUsed,
      });

      if (nextSwapsUsed === puzzle.maxSwaps && !isWaffleSolved(nextLetters, puzzle.solutionLetters)) {
        toast.message("Move budget used up. You can still keep swapping.");
      }
    },
    [currentLetters, flashTiles, puzzle, queuePersistDailyProgress, setCurrentLetters, setSwapsUsed, swapsUsed],
  );

  const startSwapAnimation = useCallback(
    (fromIndex: number, toIndex: number) => {
      const boardElement = boardRef.current;
      const fromElement = tileRefs.current[fromIndex];
      const toElement = tileRefs.current[toIndex];

      if (!boardElement || !fromElement || !toElement) {
        commitSwap(fromIndex, toIndex);
        return;
      }

      const boardRect = boardElement.getBoundingClientRect();
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      setSwapAnimation({
        active: false,
        fromIndex,
        fromLetter: currentLetters[fromIndex] ?? "",
        fromState: tileStates[fromIndex] ?? "gray",
        fromX: fromRect.left - boardRect.left,
        fromY: fromRect.top - boardRect.top,
        toIndex,
        toLetter: currentLetters[toIndex] ?? "",
        toState: tileStates[toIndex] ?? "gray",
        toX: toRect.left - boardRect.left,
        toY: toRect.top - boardRect.top,
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setSwapAnimation((previous) => (previous ? { ...previous, active: true } : previous));
        });
      });

      scheduleTimeout(() => {
        setSwapAnimation(null);
        commitSwap(fromIndex, toIndex);
      }, SWAP_ANIMATION_MS);
    },
    [commitSwap, currentLetters, scheduleTimeout, tileStates],
  );

  const handleTileClick = useCallback(
    (index: number) => {
      if (!puzzle || !tileStates[index] || !canInteractWithTiles) {
        return;
      }

      if (selectedIndex === null) {
        setSelectedIndex(index);
        return;
      }

      if (selectedIndex === index) {
        setSelectedIndex(null);
        return;
      }

      setSelectedIndex(null);
      startSwapAnimation(selectedIndex, index);
    },
    [canInteractWithTiles, puzzle, selectedIndex, startSwapAnimation, tileStates],
  );

  const handleUndo = useCallback(() => {
    const previousMove = moveHistory[moveHistory.length - 1];

    if (!previousMove) {
      return;
    }

    setMoveHistory((previousHistory) => previousHistory.slice(0, -1));
    setCurrentLetters(previousMove.letters);
    setSwapsUsed(previousMove.swapsUsed);
    setSelectedIndex(null);
    setIsShowingSolution(false);
    setSavedRecordExists(false);
    onInvalidateResult();
    flashTiles(getChangedIndices(currentLetters, previousMove.letters));
    queuePersistDailyProgress({
      currentLetters: previousMove.letters,
      revealed: false,
      swapsUsed: previousMove.swapsUsed,
    });
  }, [
    currentLetters,
    flashTiles,
    moveHistory,
    onInvalidateResult,
    queuePersistDailyProgress,
    setCurrentLetters,
    setIsShowingSolution,
    setSavedRecordExists,
    setSwapsUsed,
  ]);

  const handleReset = useCallback(() => {
    if (!puzzle) {
      return;
    }

    const indices = currentLetters.flatMap((letter, index) =>
      letter !== puzzle.initialLetters[index] ? [index] : [],
    );

    setCurrentLetters(puzzle.initialLetters);
    setSwapsUsed(0);
    setMoveHistory([]);
    setSelectedIndex(null);
    setIsShowingSolution(false);
    setSavedRecordExists(false);
    onInvalidateResult();
    flashTiles(indices);
    queuePersistDailyProgress({
      currentLetters: puzzle.initialLetters,
      revealed: false,
      swapsUsed: 0,
      totalTime: 0,
    });
  }, [
    currentLetters,
    flashTiles,
    onInvalidateResult,
    puzzle,
    queuePersistDailyProgress,
    setCurrentLetters,
    setIsShowingSolution,
    setSavedRecordExists,
    setSwapsUsed,
  ]);

  return {
    boardRef,
    canInteractWithTiles,
    canReset,
    canUndo,
    changedTileIndices,
    handleReset,
    handleTileClick,
    handleUndo,
    hiddenSwapIndices,
    resetBoardState,
    selectedIndex,
    swapAnimation,
    tileRefs,
  };
}
