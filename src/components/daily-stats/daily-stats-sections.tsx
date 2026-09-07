"use client";

import {
  Calendar,
  CalendarCheck2,
  CircleCheckBig,
  Flame,
  Trophy,
} from "lucide-react";

import type { DailyChallengeStats } from "@/types/auth";

import { InsightRow, SummaryStat } from "./daily-stats-primitives";
import { DAILY_STATS_TIMELINE_DAYS } from "./daily-stats.helpers";

export function DailyStatsSummarySection({
  bestRunHint,
  bestRunValue,
  currentStreak,
  maxStreak,
  todaySummary,
  todaySummaryHint,
  totalWinRate,
  totalWinRateHint,
}: {
  bestRunHint: string;
  bestRunValue: string;
  currentStreak: number;
  maxStreak: number;
  todaySummary: string;
  todaySummaryHint: string;
  totalWinRate: string;
  totalWinRateHint: string;
}) {
  return (
    <section className="rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-[0_20px_50px_rgba(24,24,27,0.04)]">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Today's status"
          value={todaySummary}
          hint={todaySummaryHint}
        />
        <SummaryStat
          label="Current streak"
          value={`${currentStreak} days`}
          hint={`Best streak ${maxStreak} days`}
        />
        <SummaryStat
          label="Best run"
          value={bestRunValue}
          hint={bestRunHint}
        />
        <SummaryStat
          label="Win rate"
          value={totalWinRate}
          hint={totalWinRateHint}
        />
      </div>
    </section>
  );
}

export function DailyStatsCurrentFormSection({
  stats,
  todayCopy,
  todayHero,
}: {
  stats: DailyChallengeStats;
  todayCopy: string;
  todayHero: string;
}) {
  return (
    <section className="rounded-[32px] border border-zinc-200/80 bg-white p-7 shadow-[0_20px_50px_rgba(24,24,27,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[34rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-500">
            Current form
          </p>
          <h2 className="mt-4 text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.06em] text-zinc-950">
            {todayHero}
          </h2>
          <p className="mt-4 max-w-[40ch] text-base leading-7 text-zinc-500">
            {todayCopy}
          </p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-[0_12px_30px_rgba(124,58,237,0.24)]">
          <CalendarCheck2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        <InsightRow
          label="Best streak"
          value={`${stats.maxStreak} days`}
          icon={<Flame className="h-4 w-4" />}
        />
        <InsightRow
          label="Completed Daily Challenges"
          value={`${stats.totalCompleted}`}
          icon={<Calendar className="h-4 w-4" />}
        />
        <InsightRow
          label="Total wins"
          value={`${stats.totalWins}`}
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>
    </section>
  );
}

export function DailyStatsWeeklySnapshotSection({
  completedInRecentHistory,
  recentWins,
  weeklySummary,
  weeklyWinRate,
}: {
  completedInRecentHistory: number;
  recentWins: number;
  weeklySummary: string;
  weeklyWinRate: number;
}) {
  return (
    <section className="rounded-[32px] border border-zinc-200/80 bg-white p-7 shadow-[0_20px_50px_rgba(24,24,27,0.04)]">
      <div className="flex items-center gap-2 text-violet-700">
        <Calendar className="h-4 w-4" />
        <p className="text-base font-semibold text-zinc-900">Weekly snapshot</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{weeklySummary}</p>

      <div className="mt-6 grid gap-3">
        <InsightRow
          label="Completed this week"
          value={`${completedInRecentHistory}/${DAILY_STATS_TIMELINE_DAYS}`}
          icon={<Calendar className="h-4 w-4" />}
        />
        <InsightRow
          label="Wins this week"
          value={`${recentWins}`}
          icon={<Trophy className="h-4 w-4" />}
        />
        <InsightRow
          label="Weekly win rate"
          value={`${weeklyWinRate}%`}
          icon={<CircleCheckBig className="h-4 w-4" />}
        />
      </div>
    </section>
  );
}
