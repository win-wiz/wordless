"use client";

import WaffleDailyStatsPanel from "@/components/waffle-game/waffle-daily-stats-panel";
import { BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WaffleDailyCommunityStats, WaffleDailyStats } from "@/types/waffle";

type WaffleStatsDialogProps = {
  communityStats: WaffleDailyCommunityStats | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  stats: WaffleDailyStats | null;
};

export default function WaffleStatsDialog({
  communityStats,
  isLoading,
  isOpen,
  onClose,
  stats,
}: WaffleStatsDialogProps) {
  const hasStats = Boolean(stats || communityStats);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="mx-auto flex max-h-[calc(100dvh-2rem)] max-w-[min(96vw,72rem)] flex-col gap-0 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-0 shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
        <DialogHeader className="shrink-0 gap-3 border-b border-slate-100 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_42%),linear-gradient(to_bottom,_rgba(248,250,252,0.95),_white_68%)] px-6 pb-5 pt-6 text-left sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-[0_10px_24px_rgba(59,130,246,0.2)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-500">
                Daily Results
              </p>
              <DialogTitle className="mt-1 text-[1.8rem] font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950">
                See how today&apos;s board landed.
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm leading-6 text-slate-500">
            Review your streak, your best run, and how the wider player base is performing on today&apos;s Waffle.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {isLoading ? (
            <div className="flex min-h-[18rem] items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
                <p className="text-sm font-medium text-slate-500">Loading today&apos;s stats...</p>
              </div>
            </div>
          ) : hasStats ? (
            <WaffleDailyStatsPanel
              className="mt-0 max-w-none"
              communityStats={communityStats}
              panelClassName="space-y-8"
              showHero={false}
              stats={stats}
              variant="plain"
            />
          ) : (
            <div className="flex min-h-[18rem] items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-8">
              <div className="max-w-sm text-center">
                <p className="text-lg font-semibold text-slate-900">No stats yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Finish today&apos;s daily board and your results will show up here.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
