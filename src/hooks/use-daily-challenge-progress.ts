'use client';

import useSWR from "swr";

import { useAuthSession } from "@/hooks/use-auth-session";
import { fetchDailyChallengeRecord } from "@/lib/api";
import type { DailyChallengeProgressResponse } from "@/types/auth";

const DAILY_CHALLENGE_PROGRESS_KEY = "daily-challenge-progress";

export function useDailyChallengeProgress(date?: string, enabled = true) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthSession();
  const shouldFetchProgress =
    enabled && !isAuthLoading && isAuthenticated && Boolean(date);
  const swr = useSWR(
    shouldFetchProgress
      ? [DAILY_CHALLENGE_PROGRESS_KEY, date]
      : null,
    ([, challengeDate]: [string, string]) => fetchDailyChallengeRecord(challengeDate),
    {
      revalidateOnFocus: true,
    },
  );
  const isStatsLoading =
    shouldFetchProgress && (swr.isLoading || (swr.isValidating && !swr.data));

  return {
    ...swr,
    isAuthenticated,
    isAuthLoading,
    isStatsLoading,
    communityStats: swr.data?.communityStats ?? null,
    record: swr.data?.record ?? null,
    session: swr.data?.session ?? null,
    stats: swr.data?.stats ?? null,
  };
}

export async function refreshDailyChallengeProgress(
  date?: string,
  data?: DailyChallengeProgressResponse,
) {
  const { mutate } = await import("swr");

  if (date && data) {
    await mutate([DAILY_CHALLENGE_PROGRESS_KEY, date], data, {
      revalidate: false,
    });
    return;
  }

  await mutate(
    (key) =>
      Array.isArray(key) &&
      key[0] === DAILY_CHALLENGE_PROGRESS_KEY &&
      (!date || key[1] === date),
  );
}
