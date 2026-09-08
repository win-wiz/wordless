"use client";

import type { StrandsStats } from "@/types/strands";

export const STRANDS_STATS_KEY = "strands_stats";

export const EMPTY_STRANDS_STATS: StrandsStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  perfectGames: 0,
};

/**
 * 读取 localStorage 中的长期统计；缺失或损坏时返回 null。
 * 读取结果与 EMPTY_STRANDS_STATS 合并，容忍旧存档缺字段。
 */
export function readStrandsStats(): StrandsStats | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STRANDS_STATS_KEY);
    return raw
      ? ({ ...EMPTY_STRANDS_STATS, ...(JSON.parse(raw) as StrandsStats) } as StrandsStats)
      : null;
  } catch {
    return null;
  }
}
