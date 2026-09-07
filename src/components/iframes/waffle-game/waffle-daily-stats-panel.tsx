"use client";

import { CalendarCheck2, Flame, Globe2, Star, Target, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import type {
  WaffleDailyCommunityStats,
  WaffleDailyHistoryEntry,
  WaffleDailyStats,
} from "@/types/waffle";

function formatHistoryDate(date: string) {
  const target = new Date(`${date}T00:00:00.000Z`);
  return `${target.getUTCMonth() + 1}/${target.getUTCDate()}`;
}

function formatHistoryWeekday(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
}

function HistoryCell({ item }: { item: WaffleDailyHistoryEntry }) {
  const markerClassName = item.completed
    ? item.isWin
      ? "bg-emerald-500 text-white"
      : "bg-slate-500 text-white"
    : "bg-white text-slate-300";
  const label = item.completed
    ? item.isWin
      ? `${item.stars ?? 0}★`
      : "Done"
    : "Missed";
  const detail = item.completed
    ? item.isWin
      ? `${item.swapsUsed ?? 0} swaps`
      : "Not solved"
    : "No record";

  return (
    <div className="min-w-0 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {formatHistoryWeekday(item.date)}
      </p>
      <p className="mt-1 text-xs text-slate-400">{formatHistoryDate(item.date)}</p>
      <div
        className={`mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-xs font-semibold shadow-sm ${markerClassName} ${
          item.isToday ? "ring-4 ring-blue-100" : ""
        }`}
      >
        {item.completed ? (item.isWin ? "W" : "L") : "-"}
      </div>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {item.isToday ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-500">
            Today
          </p>
        ) : null}
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

export default function WaffleDailyStatsPanel({
  className,
  communityStats,
  panelClassName,
  stats,
  showHero = true,
  variant = "card",
}: {
  className?: string;
  communityStats: WaffleDailyCommunityStats | null;
  panelClassName?: string;
  showHero?: boolean;
  stats: WaffleDailyStats | null;
  variant?: "card" | "plain";
}) {
  if (!stats && !communityStats) {
    return null;
  }

  const personalWinRate = stats?.totalCompleted
    ? `${Math.round((stats.totalWins / stats.totalCompleted) * 100)}%`
    : "0%";
  const communitySolveRate = communityStats?.totalCompleted
    ? `${Math.round((communityStats.totalWins / communityStats.totalCompleted) * 100)}%`
    : "--";
  const todaySummary = stats?.todayRecord
    ? stats.todayRecord.isWin
      ? `${stats.todayRecord.stars}★`
      : "Not solved"
    : "--";
  const todayHint = stats?.todayRecord
    ? stats.todayRecord.isWin
      ? `${stats.todayRecord.swapsUsed} swaps • ${formatTime(stats.todayRecord.totalTime)}`
      : `${stats.todayRecord.swapsUsed} swaps used`
    : "Finish today’s board to lock in a result.";
  const bestRun = stats?.bestWinRecord
    ? `${stats.bestWinRecord.stars}★`
    : "--";
  const bestRunHint = stats?.bestWinRecord
    ? `${stats.bestWinRecord.swapsUsed} swaps • ${formatTime(stats.bestWinRecord.totalTime)}`
    : "Your best winning run will show up here.";

  const hero = showHero ? (
    <div className="flex flex-col gap-3 text-center md:text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        Daily Results
      </p>
      <h2 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">
        A stronger finish gives players a better story to share.
      </h2>
      <p className="max-w-3xl text-sm leading-7 text-slate-600">
        Keep an eye on your streak, tighten your swaps, and see how today’s board is landing across the wider player base.
      </p>
    </div>
  ) : null;

  const content = (
    <>
      {hero}

      {stats ? (
        <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", showHero && "mt-8")}>
          <SummaryCard
            hint={todayHint}
            icon={<CalendarCheck2 className="h-5 w-5" />}
            label="Today"
            value={todaySummary}
          />
          <SummaryCard
            hint={stats.currentStreak > 0 ? `${stats.currentStreak} days in a row` : "Start a run with tomorrow’s puzzle."}
            icon={<Flame className="h-5 w-5" />}
            label="Current Streak"
            value={String(stats.currentStreak)}
          />
          <SummaryCard
            hint={bestRunHint}
            icon={<Trophy className="h-5 w-5" />}
            label="Best Run"
            value={bestRun}
          />
          <SummaryCard
            hint={`${stats.totalWins} wins across ${stats.totalCompleted} completed boards`}
            icon={<Target className="h-5 w-5" />}
            label="Win Rate"
            value={personalWinRate}
          />
        </div>
      ) : null}

      {communityStats ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <SummaryCard
            hint="Completed records saved for today’s puzzle"
            icon={<Users className="h-5 w-5" />}
            label="Players Today"
            value={communityStats.totalCompleted.toLocaleString("en-US")}
          />
          <SummaryCard
            hint={`${communityStats.totalWins} solved • ${communityStats.failedCount} not solved`}
            icon={<Globe2 className="h-5 w-5" />}
            label="Community Solve Rate"
            value={communitySolveRate}
          />
          <SummaryCard
            hint={
              communityStats.totalWins > 0
                ? `${communityStats.averageSwapsOnWin.toFixed(1)} swaps on average for wins`
                : "No wins recorded yet."
            }
            icon={<Star className="h-5 w-5" />}
            label="Average Stars"
            value={communityStats.totalWins > 0 ? communityStats.averageStars.toFixed(1) : "--"}
          />
        </div>
      ) : null}

      {communityStats ? (
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Star Distribution
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Winning results saved for today’s daily board.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-6">
            {communityStats.starDistribution.map((count, index) => (
              <div
                key={`stars-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {index}★
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-900">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {stats ? (
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Last 7 Days
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-7">
            {stats.recentHistory.map((item) => (
              <HistoryCell key={item.date} item={item} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <section
      className={cn("mt-8 w-full max-w-[960px]", variant === "plain" && "mt-0 max-w-none", className)}
      id="waffle-daily-results"
    >
      {variant === "plain" ? (
        <div className={panelClassName}>{content}</div>
      ) : (
        <div
          className={cn(
            "rounded-[36px] border border-slate-200 bg-slate-50/95 px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:px-8",
            panelClassName,
          )}
        >
          {content}
        </div>
      )}
    </section>
  );
}
