"use client";

import { BarChart3, Flame, Share2, Star, Trophy } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WaffleDailyCommunityStats, WaffleDailyStats } from "@/types/waffle";

type WaffleResultPromptProps = {
  communityStats: WaffleDailyCommunityStats | null;
  isOpen: boolean;
  maxSwaps: number;
  onClose: () => void;
  onShare: () => void;
  onViewStats: () => void;
  stats: WaffleDailyStats | null;
  stars: number;
  swapsUsed: number;
};

function InsightRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function WaffleResultPrompt({
  communityStats,
  isOpen,
  maxSwaps,
  onClose,
  onShare,
  onViewStats,
  stats,
  stars,
  swapsUsed,
}: WaffleResultPromptProps) {
  const currentStreak = stats?.currentStreak ?? 0;
  const bestRun = stats?.bestWinRecord ?? null;
  const matchesBestRun = Boolean(
    bestRun &&
      bestRun.stars === stars &&
      bestRun.swapsUsed === swapsUsed,
  );
  const beatBestRun = Boolean(
    bestRun &&
      (stars > bestRun.stars ||
        (stars === bestRun.stars && swapsUsed < bestRun.swapsUsed)),
  );
  const lowerStarCount = communityStats
    ? communityStats.failedCount +
      communityStats.starDistribution
        .slice(0, Math.max(0, Math.min(stars, communityStats.starDistribution.length)))
        .reduce((sum, count) => sum + count, 0)
    : 0;
  const aheadOfPlayers =
    communityStats && communityStats.totalCompleted > 0
      ? Math.max(0, Math.min(99, Math.round((lowerStarCount / communityStats.totalCompleted) * 100)))
      : null;
  const communitySolveRate =
    communityStats && communityStats.totalCompleted > 0
      ? formatPercent((communityStats.totalWins / communityStats.totalCompleted) * 100)
      : null;
  const title =
    stars >= 5
      ? "That was a huge solve."
      : stars >= 3
        ? "That was a strong run."
        : "Nice finish.";
  const description = beatBestRun
    ? "New personal best. This is exactly the kind of result people love to post."
    : matchesBestRun
      ? "You matched your best run. Worth sharing before tomorrow’s board drops."
      : currentStreak >= 3
        ? `You’re on a ${currentStreak}-day streak now. That’s real momentum.`
        : "Your result is locked in. Share it now, or jump into the full stats panel to see how this run stacks up.";
  const primaryButtonLabel = stars >= 4 ? "Share this run" : "Share result";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[min(92vw,30rem)] rounded-[30px] border border-slate-200 bg-white p-0 shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
        <DialogHeader className="gap-3 border-b border-slate-100 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_42%),linear-gradient(to_bottom,_rgba(248,250,252,0.95),_white_68%)] px-6 pb-5 pt-6 text-left sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-[0_10px_24px_rgba(59,130,246,0.2)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-500">
                Daily Complete
              </p>
              <DialogTitle className="mt-1 text-[1.8rem] font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950">
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm leading-6 text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 py-5">
          <InsightRow
            icon={<Star className="h-4 w-4" />}
            label="Today’s Score"
            value={`${stars}/5 stars`}
          />
          <InsightRow
            icon={<BarChart3 className="h-4 w-4" />}
            label="Swap Count"
            value={`${swapsUsed}/${maxSwaps}`}
          />
          <InsightRow
            icon={<Flame className="h-4 w-4" />}
            label="Current Streak"
            value={currentStreak > 0 ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "Started"}
          />
          {aheadOfPlayers !== null ? (
            <InsightRow
              icon={<Trophy className="h-4 w-4" />}
              label="Finished Ahead Of"
              value={`${aheadOfPlayers}% of players`}
            />
          ) : null}
          {communitySolveRate ? (
            <InsightRow
              icon={<Trophy className="h-4 w-4" />}
              label="Solved Today"
              value={communitySolveRate}
            />
          ) : null}
        </div>

        <DialogFooter className="flex-row flex-wrap justify-end gap-2.5 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:space-x-0">
          <Button
            className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={onViewStats}
          >
            <BarChart3 className="h-4 w-4" />
            See full stats
          </Button>
          <Button
            className="h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)] hover:bg-blue-700"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
            {primaryButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
