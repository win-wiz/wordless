"use client";

import { CircleCheckBig, CircleDashed, CircleX, Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { formatTime } from "@/lib/utils";
import type { DailyChallengeHistoryEntry } from "@/types/auth";

import {
  DAILY_STATS_TIMELINE_DAYS,
  formatHistoryDate,
  formatHistoryWeekday,
} from "./daily-stats.helpers";

function WeeklyHistoryCell({
  weekday,
  date,
  statusLabel,
  detail,
  icon,
  isToday,
  markerClassName,
  cardClassName,
}: {
  weekday: string;
  date: string;
  statusLabel: string;
  detail: string;
  icon: ReactNode;
  isToday: boolean;
  markerClassName: string;
  cardClassName: string;
}) {
  return (
    <div className="relative min-w-0">
      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-11 flex-col items-center justify-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            {weekday}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{date}</p>
        </div>

        <div
          className={`relative z-10 mt-4 flex h-11 w-11 items-center justify-center rounded-full border-[5px] border-white shadow-sm ${markerClassName} ${
            isToday ? "ring-4 ring-violet-100 shadow-[0_8px_24px_rgba(139,92,246,0.18)]" : ""
          }`}
        >
          {icon}
        </div>

        <div
          className={`mt-4 flex min-h-[92px] w-full flex-col justify-center rounded-[20px] border px-3 py-4 shadow-[0_10px_24px_rgba(24,24,27,0.04)] transition-colors ${cardClassName}`}
        >
          {isToday ? (
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-500">
              Today
            </p>
          ) : null}
          <p className="text-sm font-semibold text-zinc-900">{statusLabel}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function getTimelineItemPresentation(
  item: DailyChallengeHistoryEntry,
  index: number,
  recentHistoryLength: number,
) {
  const markerClassName = item.completed
    ? item.isWin
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700"
    : "bg-zinc-100 text-zinc-400";
  const cardClassName = item.completed
    ? item.isWin
      ? "border-emerald-200 bg-white"
      : "border-rose-200 bg-white"
    : "border-zinc-200 bg-white/90";
  const icon = item.completed ? (
    item.isWin ? (
      <CircleCheckBig className="h-4 w-4" />
    ) : (
      <CircleX className="h-4 w-4" />
    )
  ) : (
    <CircleDashed className="h-4 w-4" />
  );
  const statusLabel = item.completed ? (item.isWin ? "Won" : "Missed") : "Idle";
  const detail = item.completed
    ? item.isWin
      ? item.attempts
        ? `${item.attempts} tries`
        : item.totalTime
          ? formatTime(item.totalTime)
          : "Completed"
      : "Not solved"
    : index < DAILY_STATS_TIMELINE_DAYS - recentHistoryLength
      ? "No record yet"
      : "No attempt";

  return {
    cardClassName,
    detail,
    icon,
    markerClassName,
    statusLabel,
  };
}

export function DailyStatsTimeline({
  completedInRecentHistory,
  recentHistoryLength,
  recentWins,
  timelineHistory,
  weeklyWinRate,
}: {
  completedInRecentHistory: number;
  recentHistoryLength: number;
  recentWins: number;
  timelineHistory: DailyChallengeHistoryEntry[];
  weeklyWinRate: number;
}) {
  return (
    <section className="rounded-[32px] border border-zinc-200/80 bg-white p-7 shadow-[0_20px_50px_rgba(24,24,27,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-violet-700">
            <Calendar className="h-4 w-4" />
              <p className="text-base font-semibold text-zinc-900">
                Last {DAILY_STATS_TIMELINE_DAYS} Daily Challenges
              </p>
          </div>
          <p className="mt-3 max-w-[56ch] text-sm leading-6 text-zinc-500">
              A cleaner {DAILY_STATS_TIMELINE_DAYS}-day view of your recent runs, with one fixed slot per day so the layout stays balanced even when your history is still sparse.
          </p>
        </div>
        <div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
          {DAILY_STATS_TIMELINE_DAYS}-day timeline
        </div>
      </div>

      <div className="mt-8 rounded-[28px] bg-zinc-50/70 px-4 py-6 md:px-5">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Won</span>
          <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Missed</span>
          <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Idle</span>
        </div>

        <div className="relative">
          <div className="absolute left-[calc(100%/14)] right-[calc(100%/14)] top-[5.125rem] hidden h-px bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200 md:block" />
          <div className="grid gap-3 md:grid-cols-7 md:gap-4">
            {timelineHistory.map((item, index) => {
              const presentation = getTimelineItemPresentation(
                item,
                index,
                recentHistoryLength,
              );

              return (
                <WeeklyHistoryCell
                  key={item.date}
                  weekday={formatHistoryWeekday(item.date)}
                  date={formatHistoryDate(item.date)}
                  statusLabel={presentation.statusLabel}
                  detail={presentation.detail}
                  icon={presentation.icon}
                  isToday={item.isToday}
                  markerClassName={presentation.markerClassName}
                  cardClassName={presentation.cardClassName}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-3 py-1.5">
          Completed {completedInRecentHistory} of {DAILY_STATS_TIMELINE_DAYS}
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1.5">
          This week {recentWins} wins
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1.5">
          Weekly win rate {weeklyWinRate}%
        </span>
      </div>
    </section>
  );
}
