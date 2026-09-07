import { formatTime, cn } from "@/lib/utils";
import type { DailyChallengeCommunityStats } from "@/types/auth";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { ShareDialog } from "./share-dialog";
import { Share2, Ghost, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";

function formatPercentage(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 10 ? 1 : 0,
    maximumFractionDigits: value > 0 && value < 10 ? 1 : 0,
  }).format(value);
}

type CommunityStatsPanelProps = {
  communityStats: DailyChallengeCommunityStats;
  maxAttempts: number;
};

type CommunityStatsSkeletonProps = {
  maxAttempts: number;
};

function CommunityStatsSkeleton({
  maxAttempts,
}: CommunityStatsSkeletonProps) {
  const rows = [
    ...Array.from({ length: maxAttempts }, (_, index) => String(index + 1)),
    "Unsolved",
  ];

  return (
    <div className="animate-pulse">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <div className="h-3.5 w-14 rounded bg-zinc-200" />
        <div className="h-4 w-56 max-w-full rounded bg-zinc-200" />
      </div>

      <div className="space-y-2">
        {rows.map((label, index) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-12 shrink-0 items-center text-[11px] font-semibold",
                label === "Unsolved" ? "text-zinc-400" : "text-zinc-300",
              )}
            >
              {label}
            </div>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-zinc-100">
              <div
                className="h-full rounded-md bg-zinc-200"
                style={{
                  width: `${Math.max(24, 100 - index * 10)}%`,
                }}
              />
            </div>
            <div className="h-4 w-11 shrink-0 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityStatsPanel({
  communityStats,
  maxAttempts,
}: CommunityStatsPanelProps) {
  const solveRate = (communityStats.totalWins / communityStats.totalCompleted) * 100;
  const distributionRows = [
    ...communityStats.guessDistribution.slice(0, maxAttempts).map((count, index) => ({
      label: String(index + 1),
      count,
      toneClassName: "bg-violet-500",
    })),
    {
      label: "Unsolved",
      count: communityStats.failedCount,
      toneClassName: "bg-zinc-400",
    },
  ];
  const peakCount = Math.max(...distributionRows.map((row) => row.count), 1);
  const solvedSummary =
    communityStats.totalWins > 0
      ? `${communityStats.totalWins} solved (${formatPercentage(solveRate)}%)`
      : "No one has solved it yet";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Today
        </p>
        <p className="text-xs text-zinc-500">
          {communityStats.totalCompleted} player{communityStats.totalCompleted === 1 ? "" : "s"} finished · {solvedSummary}
        </p>
      </div>

      <div className="space-y-2">
        {distributionRows.map((row) => {
          const width = row.count > 0 ? (row.count / peakCount) * 100 : 0;
          const isFailedRow = row.label === "Unsolved";
          const percentage =
            communityStats.totalCompleted > 0
              ? (row.count / communityStats.totalCompleted) * 100
              : 0;
          const percentageLabel =
            row.count > 0 ? `${formatPercentage(percentage)}%` : "0%";

          return (
            <div key={row.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-6 w-12 shrink-0 items-center text-[11px] font-semibold",
                  isFailedRow ? "text-zinc-500" : "text-zinc-600",
                )}
              >
                {row.label}
              </div>
              <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-zinc-100">
                {row.count > 0 && (
                  <div
                    className={cn(
                      "flex h-full items-center justify-end rounded-md px-2 text-[11px] font-semibold text-white transition-[width] duration-500",
                      row.toneClassName,
                    )}
                    style={{ width: `${width}%` }}
                  >
                    <span>{row.count}</span>
                  </div>
                )}
              </div>
              <p
                className={cn(
                  "w-11 shrink-0 text-right text-xs font-semibold",
                  row.count === 0 ? "text-zinc-400" : "text-zinc-500",
                )}
              >
                {percentageLabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ResultModalProps {
  isOpen: boolean;
  title: string;
  titleClassName?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  onNewGame: () => void;
  allowNewGame?: boolean;
  gameResult?: {
    isWin: boolean;
    attempts: number;
    maxAttempts: number;
    word: string;
    totalTime: number;
    wordLength: number;
    pattern?: string;
    communityStats?: DailyChallengeCommunityStats | null;
    isCommunityStatsLoading?: boolean;
  };
}

export function ResultModal({ isOpen, onClose, title, description, titleClassName, children, onNewGame, allowNewGame = true, gameResult }: ResultModalProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const isWin = gameResult?.isWin ?? true;
    const isLossLayout = Boolean(gameResult && !isWin);
    const lossDescription = "Out of attempts — the answer is revealed below.";
    const communityStats = gameResult?.communityStats ?? null;
    const isCommunityStatsLoading = gameResult?.isCommunityStatsLoading ?? false;
    const showCommunityPanel = Boolean(
      communityStats && communityStats.totalCompleted > 0,
    );
    const showCommunitySkeleton = Boolean(
      gameResult && isCommunityStatsLoading && !communityStats,
    );
    const tone = isLossLayout
      ? {
          headerClassName:
            "border-rose-100/70 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.14),_transparent_46%),linear-gradient(to_bottom,_rgba(255,241,242,0.9),_white_70%)]",
          iconClassName:
            "bg-rose-100 text-rose-500 shadow-[0_8px_20px_rgba(244,63,94,0.2)]",
          kickerClassName: "text-rose-400",
          kicker: "Round over",
          Icon: Ghost,
        }
      : {
          headerClassName:
            "border-violet-100/70 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_42%),linear-gradient(to_bottom,_rgba(245,243,255,0.9),_white_68%)]",
          iconClassName:
            "bg-violet-100 text-violet-600 shadow-[0_8px_20px_rgba(139,92,246,0.2)]",
          kickerClassName: "text-violet-500",
          kicker: "Round complete",
          Icon: PartyPopper,
        };
    const { Icon } = tone;

    useEffect(() => {
      if (!isOpen) {
        setShareDialogOpen(false);
      }
    }, [isOpen]);

    return (
      <>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              onClose();
            }
          }}
        >
          <DialogContent
            className={cn(
              "flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-y-auto rounded-[30px] p-0 shadow-[0_32px_120px_rgba(15,23,42,0.28)] [&>button]:right-5 [&>button]:top-5 [&>button]:z-20 [&>button]:flex [&>button]:h-10 [&>button]:w-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:p-0 [&>button]:opacity-100 [&>button]:shadow-sm [&>button]:ring-offset-0 [&>button]:transition-colors",
              "max-w-[min(92vw,38rem)] border border-violet-100/80 bg-white [&>button]:border-zinc-200 [&>button]:bg-white/90 [&>button]:text-zinc-500 [&>button]:hover:bg-zinc-100 [&>button]:hover:text-zinc-700",
            )}
          >
            <DialogHeader
              className={cn(
                "gap-3 border-b px-7 pb-6 pt-7 text-left sm:text-left",
                tone.headerClassName,
                titleClassName
              )}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                    tone.iconClassName,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.28em]",
                      tone.kickerClassName,
                    )}
                  >
                    {tone.kicker}
                  </p>
                  <DialogTitle className="text-[1.8rem] font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-950">
                    {title}
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-sm leading-6 text-zinc-500">
                {description || (isLossLayout ? lossDescription : "")}
              </DialogDescription>
            </DialogHeader>

            <div className="px-7 py-6">
              {children}
              {gameResult && (
                <div
                  className={cn(
                    "flex items-center justify-center gap-3 text-sm",
                    children ? "mt-5" : undefined,
                  )}
                >
                  <span className="text-zinc-400">Attempts</span>
                  <span className="font-semibold tracking-[-0.01em] text-zinc-900">
                    {gameResult.attempts}/{gameResult.maxAttempts}
                  </span>
                  <span className="h-3.5 w-px bg-zinc-200" />
                  <span className="text-zinc-400">Time</span>
                  <span className="font-semibold tracking-[-0.01em] text-zinc-900">
                    {formatTime(gameResult.totalTime)}
                  </span>
                </div>
              )}
            </div>

            {(showCommunityPanel || showCommunitySkeleton) && gameResult && (
              <div className="border-t border-zinc-100 px-7 py-5">
                {showCommunityPanel && communityStats ? (
                  <CommunityStatsPanel
                    communityStats={communityStats}
                    maxAttempts={gameResult.maxAttempts}
                  />
                ) : (
                  <CommunityStatsSkeleton maxAttempts={gameResult.maxAttempts} />
                )}
              </div>
            )}

            <DialogFooter className="flex-row flex-wrap justify-end gap-2.5 border-t border-zinc-100 bg-zinc-50/60 px-7 py-5 sm:space-x-0">
              <Button
                onClick={() => setShareDialogOpen(true)}
                className="h-11 rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                <Share2 size={15} />
                Share Result
              </Button>
              {!isLossLayout && (
                <Button
                  className="h-11 rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                  onClick={onClose}
                >
                  Close
                </Button>
              )}
              {allowNewGame && (
                <Button
                  className="h-11 rounded-full bg-violet-600 px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.24)] hover:bg-violet-700"
                  onClick={onNewGame}
                >
                  New Game
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        {gameResult && (
          <ShareDialog
            isOpen={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            title="Share Your Result"
            description={gameResult.isWin ? "Show off your victory!" : "Challenge your friends to do better!"}
            gameResult={gameResult}
          />
        )}
      </>
    )
}
