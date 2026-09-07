"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

import { fetchDailyWord } from "@/lib/api";

import { DailyStatsDashboard } from "./daily-stats-dashboard";

export function DailyStatsPageContent({
  challengeDate,
}: {
  challengeDate?: string;
}) {
  const shouldFetchDailyChallengeDate = !challengeDate;
  const { data: dailyWord } = useSWR(
    shouldFetchDailyChallengeDate ? ["daily-stats-panel-date"] : null,
    () => fetchDailyWord(),
    {
      revalidateOnFocus: false,
    },
  );
  const resolvedChallengeDate = challengeDate ?? dailyWord?.date;

  return (
    <main className="min-h-[calc(100dvh-8rem)] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.06),transparent_34%),linear-gradient(180deg,#fcfbff_0%,#ffffff_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 md:px-6 md:py-12">
        <section className="flex flex-col gap-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex w-fit rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                Daily progress
              </div>
              <h1 className="text-[2.75rem] font-semibold leading-none tracking-[-0.06em] text-zinc-950 md:text-[3.75rem]">
                Personal Stats
              </h1>
              <p className="mt-4 max-w-[56rem] text-lg leading-8 text-zinc-500">
                A cleaner dashboard for your Daily Challenge performance, streaks, and weekly history.
              </p>
            </div>

            <Link
              href="/?mode=daily"
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Daily Challenge
            </Link>
          </div>

          <DailyStatsDashboard challengeDate={resolvedChallengeDate} />
        </section>
      </div>
    </main>
  );
}
