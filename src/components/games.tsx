'use client'

import { useEffect, useState } from "react";
import type { RuntimeGameModeConfig } from "@/server/game-modes";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Share2,
  XCircle,
} from "lucide-react";

import { useAuthDialog } from "@/components/auth/auth-dialog-provider";
import ConfettiEffect from "@/components/confetti-effect";
import { GameGrid } from "@/components/game-grid";
import { GameToolbar } from "@/components/game-toolbar";
import KeyBoard from "@/components/key-board";
import { ResultModal } from "@/components/result-modal";
import { ShareDialog } from "@/components/share-dialog";
import { useWordlessGame } from "@/hooks/use-wordless-game";
import { cn, formatTime } from "@/lib/utils";

const gridColMaps: Record<number, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
};

function renderResultContent(isLoss: boolean, word: string) {
  if (!isLoss) {
    return null;
  }

  return (
    <p className="text-center text-[2rem] font-bold leading-none tracking-[0.28em] text-zinc-950 sm:text-[2.4rem]">
      {word.toUpperCase()}
    </p>
  );
}

function renderAnswerWord(word: string, isWin: boolean) {
  return (
    <div className="flex flex-nowrap justify-center gap-2 sm:gap-2.5">
      {word
        .toUpperCase()
        .split("")
        .map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg font-bold uppercase shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:h-12 sm:w-12 sm:text-xl",
              isWin
                ? "border-emerald-300 bg-emerald-500 text-white"
                : "border-rose-300 bg-rose-500 text-white",
            )}
          >
            {letter}
          </div>
        ))}
    </div>
  );
}

function DailyCompletedStatePanel({
  canRetry,
  gameResult,
  onOpenResult,
  onOpenShare,
  onRetry,
  saveState,
}: {
  canRetry: boolean;
  gameResult: ReturnType<typeof useWordlessGame>['gameResultData'];
  onOpenResult: ReturnType<typeof useWordlessGame>['handleOpenResultModal'];
  onOpenShare: () => void;
  onRetry: ReturnType<typeof useWordlessGame>['retryPendingDailyRecordSave'];
  saveState: ReturnType<typeof useWordlessGame>['dailyRecordSaveState'];
}) {
  const { openLoginDialog } = useAuthDialog();

  if (!gameResult) {
    return null;
  }

  const isWin = gameResult.isWin;
  const baseTone = isWin
    ? {
        cardClassName:
          "border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(255,255,255,0.98))] text-emerald-950 shadow-[0_22px_60px_rgba(16,185,129,0.10)]",
        iconWrapClassName: "bg-emerald-100 text-emerald-600",
        eyebrowClassName: "text-emerald-500",
        bodyClassName: "text-emerald-700",
        badgeClassName: "border-emerald-200 bg-emerald-100 text-emerald-700",
        primaryButtonClassName:
          "border-emerald-200 bg-emerald-500 text-white hover:bg-emerald-600",
        secondaryButtonClassName:
          "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
        Icon: CheckCircle2,
      }
    : {
        cardClassName:
          "border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,255,255,0.98))] text-rose-950 shadow-[0_22px_60px_rgba(244,63,94,0.10)]",
        iconWrapClassName: "bg-rose-100 text-rose-600",
        eyebrowClassName: "text-rose-500",
        bodyClassName: "text-rose-700",
        badgeClassName: "border-rose-200 bg-rose-100 text-rose-700",
        primaryButtonClassName:
          "border-rose-200 bg-rose-500 text-white hover:bg-rose-600",
        secondaryButtonClassName:
          "border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
        Icon: XCircle,
      };

  const saveStatus =
    saveState === "saving"
      ? {
          label: "Saving record",
          description: "We’re syncing this result to your account now.",
          Icon: LoaderCircle,
          iconClassName: "animate-spin",
        }
      : saveState === "requires-auth"
        ? {
            label: "Save available after sign-in",
            description: "Sign in to keep today’s result synced across devices.",
            Icon: AlertCircle,
            iconClassName: "",
          }
        : saveState === "saved"
          ? {
              label: "Saved to your account",
              description: "You can come back anytime and review this challenge.",
              Icon: CheckCircle2,
              iconClassName: "",
            }
          : {
              label: canRetry ? "Save needs another try" : "Save unavailable",
              description: canRetry
                ? "Your record is kept locally. Retry saving when you’re ready."
                : "Your result is complete, but we couldn’t save it just yet.",
              Icon: AlertCircle,
              iconClassName: "",
            };

  const headline =
    saveState === "requires-auth"
      ? isWin
        ? "You solved today’s challenge."
        : "You’ve finished today’s challenge."
      : isWin
        ? "Today’s result has been saved to your account."
        : "Today’s challenge has been completed.";

  const description =
    saveState === "saved"
      ? isWin
        ? "The board is tucked away now, but your result is still easy to review or share."
        : "The board is tucked away now, and you can still review the full result anytime."
      : saveStatus.description;

  const SaveStatusIcon = saveStatus.Icon;
  const OutcomeIcon = baseTone.Icon;

  return (
    <div
      className={cn(
        "w-full max-w-[640px] rounded-[30px] border px-4 py-5 sm:px-7 sm:py-6",
        baseTone.cardClassName,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
              baseTone.iconWrapClassName,
            )}
          >
            <OutcomeIcon className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />
          </div>
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.28em]",
              baseTone.eyebrowClassName,
            )}
          >
            Daily Record
          </p>
        </div>

        <p className="mt-3 text-[1.05rem] font-semibold leading-7 sm:text-[1.15rem]">
          {headline}
        </p>
        <p className={cn("mt-1 text-sm leading-6 sm:max-w-[42rem]", baseTone.bodyClassName)}>
          {description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
              baseTone.badgeClassName,
            )}
          >
            {isWin ? "Won" : "Missed"}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-xs font-semibold text-zinc-700">
            {gameResult.attempts}/{gameResult.maxAttempts} attempts
          </span>
          <span className="inline-flex items-center rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-xs font-semibold text-zinc-700">
            {formatTime(gameResult.totalTime)}
          </span>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/70 bg-white/75 px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            Today&apos;s Answer
          </p>
          <div className="mt-3">{renderAnswerWord(gameResult.word, isWin)}</div>
        </div>

        <div className="mt-5 rounded-[22px] border border-white/70 bg-white/55 px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <SaveStatusIcon className={cn("h-3.5 w-3.5", saveStatus.iconClassName)} />
              <span>{saveStatus.label}</span>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onOpenShare}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors sm:min-w-[10rem] sm:w-auto sm:px-5",
                  baseTone.primaryButtonClassName,
                )}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                type="button"
                onClick={onOpenResult}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors sm:min-w-[10rem] sm:w-auto sm:px-5",
                  baseTone.secondaryButtonClassName,
                )}
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              {saveState === "requires-auth" && (
                <button
                  type="button"
                  onClick={() => openLoginDialog({ redirect: "/?mode=daily" })}
                  className="col-span-2 inline-flex h-11 w-full items-center justify-center rounded-full border border-amber-200 bg-amber-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 sm:w-auto"
                >
                  Sign in
                </button>
              )}
              {saveState === "error" && canRetry && (
                <button
                  type="button"
                  onClick={() => {
                    void onRetry();
                  }}
                  className="col-span-2 inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto"
                >
                  Retry save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GamesProps {
  initialDailyConfig: RuntimeGameModeConfig;
  initialUnlimitedConfig: RuntimeGameModeConfig;
}

export default function Games({
  initialDailyConfig,
  initialUnlimitedConfig,
}: GamesProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const game = useWordlessGame({
    initialDailyConfig,
    initialUnlimitedConfig,
  });
  const gridCol = gridColMaps[game.columns] || 'grid-cols-3';
  const showDailyCompletedPanel =
    game.gameMode === "daily" &&
    game.isGameOver &&
    Boolean(game.gameResultData);

  useEffect(() => {
    if (!game.gameResultData) {
      setShareDialogOpen(false);
    }
  }, [game.gameResultData]);

  return (
    <>
      <ConfettiEffect isActive={game.showConfetti} />
      <div className="relative z-0">
        <div className="container mx-auto flex min-h-[600px] max-w-screen-md flex-col">
          <div className="flex flex-1 flex-col items-center py-8">
            <div className="flex min-h-[600px] flex-col items-center">
              {game.gridContent.length > 0 ? (
                <>
                  <GameToolbar
                    canDecreaseLength={game.canDecreaseLength}
                    canIncreaseLength={game.canIncreaseLength}
                    columns={game.columns}
                    dailyChallenge={game.dailyChallenge}
                    gameMode={game.gameMode}
                    hasFirstInput={game.hasFirstInput}
                    isGameOver={game.isGameOver}
                    onDecrease={game.handleDecrease}
                    onIncrease={game.handleIncrease}
                    onStartGame={game.handleStartGame}
                    onTimeChange={game.handleTotalTimeChange}
                    showKeyboard={game.showKeyboard}
                      totalTime={game.totalTime}
                  />
                  <div className="relative flex flex-col items-center">
                    {showDailyCompletedPanel ? (
                      <div className="flex min-h-[28rem] w-full max-w-[640px] items-center justify-center py-4">
                        <DailyCompletedStatePanel
                          canRetry={game.canRetryDailyRecordSave}
                          gameResult={game.gameResultData}
                          onOpenResult={game.handleOpenResultModal}
                          onOpenShare={() => setShareDialogOpen(true)}
                          onRetry={game.retryPendingDailyRecordSave}
                          saveState={game.dailyRecordSaveState}
                        />
                      </div>
                    ) : (
                      <>
                        <div className={game.isProcessingEnter ? "opacity-70 transition-opacity" : "transition-opacity"}>
                          <GameGrid
                            gridContent={game.gridContent}
                            columns={game.columns}
                            gridCol={gridCol}
                            currentCell={game.currentCell}
                            showActiveCellHighlight={game.showActiveCellHighlight}
                            currentRow={game.currentRow}
                            invalidRows={game.invalidRows}
                            flippingRows={game.flippingRows}
                            cellStates={game.cellStates}
                            isCurrentRowReady={game.isCurrentRowReady}
                            isInteractionLocked={game.isInteractionLocked}
                            isLoadingWord={game.isLoadingWord}
                            deletingCells={game.deletingCells}
                            poppingCells={game.poppingCells}
                          />
                        </div>
                        {game.isProcessingEnter && (
                          <div className="pointer-events-none absolute left-1/2 top-[38%] z-10 -translate-x-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/95 px-4 py-2 text-sm font-medium text-violet-700 shadow-[0_10px_30px_rgba(139,92,246,0.16)] backdrop-blur">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              <span>Checking your guess...</span>
                            </div>
                          </div>
                        )}
                        {game.showKeyboard && (
                          <div className="mt-auto">
                            <KeyBoard
                              onKeyPress={game.handleKeyPress}
                              onDelete={game.handleDelete}
                              onEnter={game.handleEnter}
                              letterStates={game.keyboardLetterStates}
                              isEnterEnabled={game.isEnterEnabled}
                              isInteractionLocked={game.isInteractionLocked}
                              isLoadingWord={game.isLoadingWord}
                              isProcessingEnter={game.isProcessingEnter}
                              statusMessage={game.statusMessage}
                              activeKeyboardKey={game.activeKeyboardKey}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="relative">
                    <div className="h-12 w-12 animate-loading rounded-full border-4 border-violet-200 border-t-violet-500" />
                    <span className="absolute left-1/2 top-14 -translate-x-1/2 text-violet-500">
                      Loading...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ResultModal
        isOpen={game.dialogVisible}
        onClose={game.handleDismissResultModal}
        onNewGame={game.handleStartGame}
        allowNewGame={game.gameMode === 'unlimited'}
        title={game.dialogTitle || 'You Won!'}
        description={game.dialogMessage}
        titleClassName="text-left"
        gameResult={game.gameResultData || undefined}
      >
        {renderResultContent(
          Boolean(game.gameResultData && !game.gameResultData.isWin),
          game.word,
        )}
      </ResultModal>

      {game.gameResultData && (
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          title="Share Your Result"
          description={game.gameResultData.isWin ? "Show off your victory!" : "Challenge your friends to do better!"}
          gameResult={game.gameResultData}
        />
      )}
    </>
  );
}
