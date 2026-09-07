"use client";

import { RotateCcw, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import ConfettiEffect from "@/components/confetti-effect";
import WaffleResultPrompt from "@/components/iframes/waffle-game/waffle-result-prompt";
import WaffleStatsDialog from "@/components/iframes/waffle-game/waffle-stats-dialog";
import {
  buildDailyShareText,
  buildWaffleSharePreviewCard,
  buildWaffleShareSummary,
} from "@/components/iframes/waffle-game/waffle-client-share";
import {
  buildBoardCells,
  getChangedIndices,
} from "@/components/iframes/waffle-game/waffle-client-helpers";
import type {
  SwapAnimation,
  WaffleApiResponse,
  WaffleMode,
  WaffleMoveSnapshot,
  WaffleShareSnapshot,
} from "@/components/iframes/waffle-game/waffle-client-types";
import {
  ActionButton,
  InfoToolbarPill,
  WaffleGameBoard,
} from "@/components/iframes/waffle-game/waffle-game-ui";
import { useWaffleDailyProgress } from "@/components/iframes/waffle-game/use-waffle-daily-progress";
import { ShareDialog } from "@/components/share-dialog";
import { cn } from "@/lib/utils";
import {
  countRemainingSwaps,
  countWaffleStars,
  evaluateWaffleBoard,
  isWaffleSolved,
  swapWaffleLetters,
} from "@/lib/waffle-game";

const SWAP_ANIMATION_MS = 260;
const TILE_FLASH_MS = 520;

export default function WaffleClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode: WaffleMode = searchParams.get("mode") === "unlimited" ? "unlimited" : "daily";
  const isStatsDialogOpen = mode === "daily" && searchParams.get("panel") === "stats";

  const [puzzle, setPuzzle] = useState<WaffleApiResponse | null>(null);
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [swapsUsed, setSwapsUsed] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [moveHistory, setMoveHistory] = useState<WaffleMoveSnapshot[]>([]);
  const [changedTileIndices, setChangedTileIndices] = useState<number[]>([]);
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation | null>(null);
  const [isShowingSolution, setIsShowingSolution] = useState(false);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareSnapshot, setShareSnapshot] = useState<WaffleShareSnapshot | null>(null);
  const [resultPromptOpen, setResultPromptOpen] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const timeoutIdsRef = useRef<number[]>([]);
  const previousSolvedRef = useRef(false);
  const solved = useMemo(
    () => Boolean(puzzle && currentLetters.length && isWaffleSolved(currentLetters, puzzle.solutionLetters)),
    [currentLetters, puzzle],
  );

  const {
    communityStats,
    dailyStats,
    progressLoaded,
    queuePersistDailyProgress,
    resetDailyProgressState,
    savedRecordExists,
    setSavedRecordExists,
    suppressAutoResultPromptRef,
  } = useWaffleDailyProgress({
    currentLetters,
    isShowingSolution,
    mode,
    puzzle,
    setCurrentLetters,
    setIsShowingSolution,
    setSwapsUsed,
    solved,
    swapsUsed,
  });

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

  useEffect(() => () => clearTimeouts(), [clearTimeouts]);

  useEffect(() => {
    let cancelled = false;

    async function loadPuzzle() {
      setLoading(true);
      setError(null);
      setSelectedIndex(null);
      setMoveHistory([]);
      setChangedTileIndices([]);
      setSwapAnimation(null);
      setIsShowingSolution(false);
      setIsConfettiActive(false);
      setShareDialogOpen(false);
      setShareSnapshot(null);
      setResultPromptOpen(false);
      previousSolvedRef.current = false;
      resetDailyProgressState();

      try {
        const response = await fetch(`/api/waffle/${mode}`, { cache: "no-store" });
        const payload = (await response.json()) as WaffleApiResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Waffle puzzle is unavailable.");
        }

        if (cancelled) {
          return;
        }

        setPuzzle(payload);
        setCurrentLetters(payload.initialLetters);
        setSwapsUsed(0);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setPuzzle(null);
        setCurrentLetters([]);
        setError(loadError instanceof Error ? loadError.message : "Failed to load the Waffle puzzle.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPuzzle();

    return () => {
      cancelled = true;
    };
  }, [mode, reloadToken, resetDailyProgressState]);

  const tileStates = useMemo(
    () =>
      puzzle && currentLetters.length === puzzle.tileCount
        ? evaluateWaffleBoard(currentLetters, puzzle.solutionLetters)
        : [],
    [currentLetters, puzzle],
  );
  const remainingSwaps = useMemo(
    () => (puzzle ? countRemainingSwaps(swapsUsed, puzzle.maxSwaps) : 0),
    [puzzle, swapsUsed],
  );
  const stars = useMemo(
    () => (solved && puzzle && !isShowingSolution ? countWaffleStars(swapsUsed, puzzle.maxSwaps) : 0),
    [isShowingSolution, puzzle, solved, swapsUsed],
  );
  const boardCells = useMemo(() => buildBoardCells(currentLetters, tileStates), [currentLetters, tileStates]);

  const hiddenSwapIndices = useMemo(() => {
    if (!swapAnimation) {
      return new Set<number>();
    }

    return new Set<number>([swapAnimation.fromIndex, swapAnimation.toIndex]);
  }, [swapAnimation]);

  const interactionLocked = loading || !puzzle || Boolean(swapAnimation);
  const canInteractWithTiles = !interactionLocked && !isShowingSolution && !solved;
  const canUndo = moveHistory.length > 0 && !interactionLocked && !isShowingSolution && !solved;
  const canReset = Boolean(
    puzzle &&
      mode === "unlimited" &&
      !interactionLocked &&
      (swapsUsed > 0 || currentLetters.join("") !== puzzle.initialLetters.join("")),
  );
  const hasShareSnapshot = Boolean(shareSnapshot);
  const canShare = Boolean(
    puzzle &&
      mode === "daily" &&
      (solved || (isShowingSolution && hasShareSnapshot) || (savedRecordExists && !isShowingSolution)),
  );

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/waffle-game`
      : "https://wordlessgame.app/waffle-game";
  const shareInput = useMemo(
    () => ({
      communityStats,
      dailyStats,
      isShowingSolution,
      mode,
      puzzle,
      shareSnapshot,
      solved,
      stars,
      tileStates,
    }),
    [communityStats, dailyStats, isShowingSolution, mode, puzzle, shareSnapshot, solved, stars, tileStates],
  );

  const dailyShareText = useMemo(
    () =>
      buildDailyShareText({
        ...shareInput,
        baseUrl: shareUrl,
      }),
    [shareInput, shareUrl],
  );
  const shareSummary = useMemo(() => buildWaffleShareSummary(shareInput), [shareInput]);
  const sharePreviewCard = useMemo(() => buildWaffleSharePreviewCard(shareInput), [shareInput]);

  const updatePanelSearchParam = useCallback(
    (panelValue: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (panelValue) {
        params.set("panel", panelValue);
      } else {
        params.delete("panel");
      }

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openStatsDialog = useCallback(() => {
    updatePanelSearchParam("stats");
  }, [updatePanelSearchParam]);

  const closeStatsDialog = useCallback(() => {
    updatePanelSearchParam(null);
  }, [updatePanelSearchParam]);

  useEffect(() => {
    if (!solved || isShowingSolution || previousSolvedRef.current) {
      previousSolvedRef.current = solved;
      return;
    }

    setIsConfettiActive(true);
    scheduleTimeout(() => setIsConfettiActive(false), 3200);
    toast.success(stars > 0 ? `Solved with ${stars} stars.` : "Puzzle solved.");
    setShareSnapshot({
      solved: true,
      stars,
      tileStates,
    });

    if (!suppressAutoResultPromptRef.current) {
      setResultPromptOpen(true);
    }

    previousSolvedRef.current = true;
  }, [isShowingSolution, scheduleTimeout, solved, stars, suppressAutoResultPromptRef, tileStates]);

  const handleOpenShareFromPrompt = useCallback(() => {
    setResultPromptOpen(false);
    setShareDialogOpen(true);
  }, []);

  const handleOpenStatsFromPrompt = useCallback(() => {
    setResultPromptOpen(false);
    openStatsDialog();
  }, [openStatsDialog]);

  useEffect(() => {
    if (isStatsDialogOpen && resultPromptOpen) {
      setResultPromptOpen(false);
    }
  }, [isStatsDialogOpen, resultPromptOpen]);

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
      [currentLetters, flashTiles, puzzle, queuePersistDailyProgress, swapsUsed],
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
    setShareSnapshot(null);
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
    queuePersistDailyProgress,
    setSavedRecordExists,
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
    setShareSnapshot(null);
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
    puzzle,
    queuePersistDailyProgress,
    setSavedRecordExists,
  ]);

  return (
    <section className="relative z-0">
      <ConfettiEffect isActive={isConfettiActive} />
      <div className="container mx-auto flex min-h-[720px] max-w-screen-lg flex-col">
        <div className="flex flex-1 flex-col items-center py-10">
          <div className="flex min-h-[720px] w-full flex-col items-center">
            <div className="mb-8 flex w-full justify-center">
              <div className="flex w-full max-w-[760px] flex-wrap items-center justify-center gap-3">
                <InfoToolbarPill
                  label={mode === "daily" ? "Date" : "Difficulty"}
                  value={mode === "daily" ? (puzzle?.date ?? "--") : (puzzle?.difficulty ?? "--")}
                />
                <InfoToolbarPill
                  label="Moves"
                  value={puzzle ? `${remainingSwaps}/${puzzle.maxSwaps}` : "--"}
                />
                {mode === "unlimited" ? (
                  <button
                    className="flex h-12 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-blue-200 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
                    onClick={() => setReloadToken((value) => value + 1)}
                    type="button"
                  >
                    Refresh
                  </button>
                ) : null}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="relative">
                  <div className="h-14 w-14 animate-loading rounded-full border-4 border-slate-200 border-t-blue-500" />
                  <span className="absolute left-1/2 top-14 -translate-x-1/2 text-slate-500">
                    Loading...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[420px] w-full max-w-[760px] items-center justify-center rounded-3xl border border-rose-200 bg-rose-50 px-6 text-center text-sm text-rose-700">
                {error}
              </div>
            ) : (
              <div className="relative flex w-full flex-col items-center">
                <WaffleGameBoard
                  boardCells={boardCells}
                  boardRef={boardRef}
                  canInteractWithTiles={canInteractWithTiles}
                  changedTileIndices={changedTileIndices}
                  hiddenSwapIndices={hiddenSwapIndices}
                  isShowingSolution={isShowingSolution}
                  onTileClick={handleTileClick}
                  selectedIndex={selectedIndex}
                  solved={solved}
                  swapAnimation={swapAnimation}
                  tileRefs={tileRefs}
                />

                <div
                  className={cn(
                    "mt-6 w-full max-w-[760px] gap-3",
                    mode === "unlimited"
                      ? "grid sm:grid-cols-2"
                      : "flex flex-wrap items-center justify-center",
                  )}
                >
                  <ActionButton
                    disabled={!canUndo}
                    icon={<Undo2 className="h-4 w-4" />}
                    label="Undo"
                    onClick={handleUndo}
                  />
                  {canShare ? (
                    <button
                      className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
                      onClick={() => setShareDialogOpen(true)}
                      type="button"
                    >
                      Share
                    </button>
                  ) : null}
                  {mode === "unlimited" ? (
                    <ActionButton
                      disabled={!canReset}
                      icon={<RotateCcw className="h-4 w-4" />}
                      label="Reset Puzzle"
                      onClick={handleReset}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareDialog
        customShareText={dailyShareText}
        description="Copy your Waffle daily result with the emoji board."
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        previewCard={sharePreviewCard}
        summary={shareSummary}
        theme="waffle"
        title="Share Waffle Result"
        url={shareUrl}
      />
      <WaffleStatsDialog
        communityStats={communityStats}
        isLoading={mode === "daily" && !progressLoaded}
        isOpen={isStatsDialogOpen}
        onClose={closeStatsDialog}
        stats={dailyStats}
      />
      <WaffleResultPrompt
        communityStats={communityStats}
        isOpen={resultPromptOpen}
        maxSwaps={puzzle?.maxSwaps ?? 15}
        onClose={() => setResultPromptOpen(false)}
        onShare={handleOpenShareFromPrompt}
        onViewStats={handleOpenStatsFromPrompt}
        stats={dailyStats}
        stars={shareSnapshot?.stars ?? stars}
        swapsUsed={swapsUsed}
      />
    </section>
  );
}
