"use client";

import { ArrowLeftRight, CalendarDays, RotateCcw, Sparkles, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ConfettiEffect from "@/components/confetti-effect";
import WaffleBoardSkeleton from "@/components/waffle-game/waffle-board-skeleton";
import WaffleResultPrompt from "@/components/waffle-game/waffle-result-prompt";
import WaffleStatsDialog from "@/components/waffle-game/waffle-stats-dialog";
import {
  buildBoardCells,
} from "@/components/waffle-game/waffle-client-helpers";
import type {
  WaffleMode,
} from "@/components/waffle-game/waffle-client-types";
import {
  ActionButton,
  WaffleGameFrame,
  InfoToolbarPill,
  WaffleGameBoard,
} from "@/components/waffle-game/waffle-game-ui";
import { useWaffleBoardController } from "@/components/waffle-game/use-waffle-board-controller";
import { useWaffleDailyProgress } from "@/components/waffle-game/use-waffle-daily-progress";
import { useWafflePuzzleSession } from "@/components/waffle-game/use-waffle-puzzle-session";
import { useWaffleResultController } from "@/components/waffle-game/use-waffle-result-controller";
import { ShareDialog } from "@/components/share-dialog";
import { cn } from "@/lib/utils";
import {
  countRemainingSwaps,
  countWaffleStars,
  evaluateWaffleBoard,
  isWaffleSolved,
} from "@/lib/waffle-game";

export default function WaffleClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode: WaffleMode = searchParams.get("mode") === "unlimited" ? "unlimited" : "daily";
  const isStatsDialogOpen = mode === "daily" && searchParams.get("panel") === "stats";

  const {
    currentLetters,
    error,
    isShowingSolution,
    loadPuzzle,
    loading,
    puzzle,
    setCurrentLetters,
    setIsShowingSolution,
    setSwapsUsed,
    swapsUsed,
  } = useWafflePuzzleSession();
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

  const tileStates = useMemo(
    () =>
      puzzle && currentLetters.length === puzzle.tileCount
        ? evaluateWaffleBoard(currentLetters, puzzle.solutionLetters)
        : [],
    [currentLetters, puzzle],
  );

  const stars = useMemo(
    () => (solved && puzzle && !isShowingSolution ? countWaffleStars(swapsUsed, puzzle.maxSwaps) : 0),
    [isShowingSolution, puzzle, solved, swapsUsed],
  );

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

  const {
    canShare,
    closeResultPrompt,
    closeShareDialog,
    dailyShareText,
    handleOpenShareFromPrompt,
    handleOpenStatsFromPrompt,
    invalidateShareSnapshot,
    isConfettiActive,
    openShareDialog,
    resetResultState,
    resultPromptOpen,
    resultStars,
    shareDialogOpen,
    sharePreviewCard,
    shareSummary,
    shareUrl,
  } = useWaffleResultController({
    communityStats,
    dailyStats,
    isShowingSolution,
    isStatsDialogOpen,
    mode,
    onOpenStats: openStatsDialog,
    puzzle,
    savedRecordExists,
    solved,
    stars,
    suppressAutoResultPromptRef,
    tileStates,
  });

  const {
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
  } = useWaffleBoardController({
    currentLetters,
    isShowingSolution,
    loading,
    mode,
    onInvalidateResult: invalidateShareSnapshot,
    puzzle,
    queuePersistDailyProgress,
    setCurrentLetters,
    setIsShowingSolution,
    setSavedRecordExists,
    setSwapsUsed,
    solved,
    swapsUsed,
    tileStates,
  });

  const resetClientStateBeforeLoad = useCallback(() => {
    resetBoardState();
    resetResultState();
    resetDailyProgressState();
  }, [resetBoardState, resetDailyProgressState, resetResultState]);

  const loadPuzzleForMode = useCallback(
    (activeMode: WaffleMode, signal?: AbortSignal) => {
      resetClientStateBeforeLoad();
      void loadPuzzle(activeMode, { signal });
    },
    [loadPuzzle, resetClientStateBeforeLoad],
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadPuzzleForMode(mode, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadPuzzleForMode, mode]);

  const remainingSwaps = useMemo(
    () => (puzzle ? countRemainingSwaps(swapsUsed, puzzle.maxSwaps) : 0),
    [puzzle, swapsUsed],
  );
  const boardCells = useMemo(() => buildBoardCells(currentLetters, tileStates), [currentLetters, tileStates]);
  const activePuzzle = puzzle;
  const hasPuzzle = Boolean(activePuzzle);

  return (
    <section className="relative z-0">
      <ConfettiEffect isActive={isConfettiActive} />
      <div className="container mx-auto flex min-h-[720px] max-w-screen-lg flex-col">
        <div className="flex flex-1 flex-col items-center py-10">
          <div className="flex min-h-[720px] w-full flex-col items-center">
            {error ? (
              <div className="flex min-h-[420px] w-full max-w-[760px] items-center justify-center rounded-3xl border border-rose-200 bg-rose-50 px-6 text-center text-sm text-rose-700">
                {error}
              </div>
            ) : loading && !hasPuzzle ? (
              <WaffleBoardSkeleton mode={mode} />
            ) : hasPuzzle ? (
              <WaffleGameFrame
                board={(
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
                )}
                footer={(
                  <div
                    className={cn(
                      "gap-3",
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
                        onClick={openShareDialog}
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
                )}
                toolbar={(
                  <>
                    <InfoToolbarPill
                      icon={
                        mode === "daily" ? (
                          <CalendarDays className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )
                      }
                      label={mode === "daily" ? "Date" : "Difficulty"}
                      value={mode === "daily" ? activePuzzle!.date : activePuzzle!.difficulty}
                    />
                    <InfoToolbarPill
                      icon={<ArrowLeftRight className="h-4 w-4" />}
                      label="Moves"
                      value={`${remainingSwaps}/${activePuzzle!.maxSwaps}`}
                    />
                    {mode === "unlimited" ? (
                      <button
                        className="flex h-12 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-blue-200 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
                        onClick={() => loadPuzzleForMode(mode)}
                        type="button"
                      >
                        Refresh
                      </button>
                    ) : null}
                  </>
                )}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ShareDialog
        customShareText={dailyShareText}
        description="Copy your Waffle daily result with the emoji board."
        isOpen={shareDialogOpen}
        onClose={closeShareDialog}
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
        onClose={closeResultPrompt}
        onShare={handleOpenShareFromPrompt}
        onViewStats={handleOpenStatsFromPrompt}
        stats={dailyStats}
        stars={resultStars}
        swapsUsed={swapsUsed}
      />
    </section>
  );
}
