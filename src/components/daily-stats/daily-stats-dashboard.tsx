"use client";

import { useDailyChallengeProgress } from "@/hooks/use-daily-challenge-progress";

import { buildDailyStatsViewModel } from "./daily-stats.helpers";
import {
  DailyStatsCurrentFormSection,
  DailyStatsSummarySection,
  DailyStatsWeeklySnapshotSection,
} from "./daily-stats-sections";
import {
  DailyStatsEmptyState,
  DailyStatsLoadingState,
  DailyStatsSignInState,
} from "./daily-stats-states";
import { DailyStatsTimeline } from "./daily-stats-timeline";

export function DailyStatsDashboard({
  challengeDate,
}: {
  challengeDate?: string;
}) {
  const dailyProgress = useDailyChallengeProgress(
    challengeDate,
    Boolean(challengeDate),
  );

  if (!challengeDate) {
    return <DailyStatsLoadingState label="Loading the latest Daily Challenge…" />;
  }

  if (dailyProgress.isAuthLoading) {
    return <DailyStatsLoadingState label="Syncing your stats…" />;
  }

  if (!dailyProgress.isAuthenticated) {
    return <DailyStatsSignInState />;
  }

  if (dailyProgress.isStatsLoading) {
    return <DailyStatsLoadingState label="Syncing your stats…" />;
  }

  if (!dailyProgress.stats) {
    return <DailyStatsEmptyState />;
  }

  const { stats } = dailyProgress;
  const viewModel = buildDailyStatsViewModel(stats, challengeDate);

  return (
    <div className="space-y-8">
      <DailyStatsSummarySection
        bestRunHint={viewModel.bestRunHint}
        bestRunValue={viewModel.bestRunValue}
        currentStreak={stats.currentStreak}
        maxStreak={stats.maxStreak}
        todaySummary={viewModel.todaySummary}
        todaySummaryHint={viewModel.todaySummaryHint}
        totalWinRate={viewModel.totalWinRate}
        totalWinRateHint={viewModel.totalWinRateHint}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <DailyStatsCurrentFormSection
          stats={stats}
          todayCopy={viewModel.todayCopy}
          todayHero={viewModel.todayHero}
        />

        <DailyStatsWeeklySnapshotSection
          completedInRecentHistory={viewModel.completedInRecentHistory}
          recentWins={viewModel.recentWins}
          weeklySummary={viewModel.weeklySummary}
          weeklyWinRate={viewModel.weeklyWinRate}
        />
      </div>

      <DailyStatsTimeline
        completedInRecentHistory={viewModel.completedInRecentHistory}
        recentHistoryLength={stats.recentHistory.length}
        recentWins={viewModel.recentWins}
        timelineHistory={viewModel.timelineHistory}
        weeklyWinRate={viewModel.weeklyWinRate}
      />
    </div>
  );
}
