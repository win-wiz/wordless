import type {
  DailyChallengeHistoryEntry,
  DailyChallengeStats,
} from "@/types/auth";
import { formatTime } from "@/lib/utils";

export const DAILY_STATS_TIMELINE_DAYS = 7;

function addUtcDays(date: string, offset: number) {
  const target = new Date(`${date}T00:00:00.000Z`);
  target.setUTCDate(target.getUTCDate() + offset);
  return target.toISOString().slice(0, 10);
}

export function formatHistoryDate(date: string) {
  const target = new Date(`${date}T00:00:00.000Z`);
  return `${target.getUTCMonth() + 1}/${target.getUTCDate()}`;
}

export function formatHistoryWeekday(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function buildTimelineHistory(
  challengeDate: string,
  recentHistory: DailyChallengeHistoryEntry[],
) {
  const historyMap = new Map(recentHistory.map((item) => [item.date, item]));

  return Array.from({ length: DAILY_STATS_TIMELINE_DAYS }, (_, index) => {
    const date = addUtcDays(
      challengeDate,
      index - (DAILY_STATS_TIMELINE_DAYS - 1),
    );
    const item = historyMap.get(date);

    return (
      item ?? {
        date,
        sequence: 0,
        completed: false,
        isWin: null,
        attempts: null,
        totalTime: null,
        isToday: date === challengeDate,
      }
    );
  });
}

export function buildDailyStatsViewModel(
  stats: DailyChallengeStats,
  challengeDate: string,
) {
  const completedInRecentHistory = stats.recentHistory.filter(
    (item) => item.completed,
  ).length;
  const recentWins = stats.recentHistory.filter((item) => item.isWin).length;
  const weeklyWinRate = completedInRecentHistory
    ? Math.round((recentWins / completedInRecentHistory) * 100)
    : 0;
  const totalWinRate = stats.totalCompleted
    ? `${Math.round((stats.totalWins / stats.totalCompleted) * 100)}%`
    : "0%";
  const todaySummary = stats.completedToday
    ? stats.todayRecord?.isWin
      ? "Solved today"
      : "Played today"
    : "Not played";
  const todayHero = stats.completedToday
    ? stats.todayRecord?.isWin
      ? `Solved in ${stats.todayRecord.attempts} tries`
      : "Played, not solved"
    : "Not played yet";
  const todayCopy = stats.todayRecord
    ? stats.todayRecord.isWin
      ? "Today's puzzle is in the books and synced to your account."
      : "You gave today's puzzle a try. Come back later and improve your result."
    : "Start today's Daily Challenge when you're ready. We'll keep the result synced automatically.";
  const bestRunValue = stats.bestWinRecord
    ? `${stats.bestWinRecord.attempts} tries`
    : "—";
  const bestRunHint = stats.bestWinRecord
    ? `Best time ${formatTime(stats.bestWinRecord.totalTime)}`
    : "No winning run yet";

  return {
    bestRunHint,
    bestRunValue,
    completedInRecentHistory,
    recentWins,
    timelineHistory: buildTimelineHistory(challengeDate, stats.recentHistory),
    todayCopy,
    todayHero,
    todaySummary,
    todaySummaryHint: stats.todayRecord
      ? `Time ${formatTime(stats.todayRecord.totalTime)}`
      : "Ready when you are",
    totalWinRate,
    totalWinRateHint: `${stats.totalWins} wins out of ${stats.totalCompleted} completed`,
    weeklySummary: `${completedInRecentHistory} completed, ${recentWins} wins, ${weeklyWinRate}% win rate over the last 7 challenges.`,
    weeklyWinRate,
  };
}
