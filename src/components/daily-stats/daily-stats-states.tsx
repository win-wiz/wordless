"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { useAuthDialog } from "@/components/auth/auth-dialog-provider";

function StatsPanelShell({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "soft";
}) {
  return (
    <div
      className={`rounded-[32px] border p-8 shadow-[0_20px_60px_rgba(24,24,27,0.05)] ${
        tone === "soft"
          ? "border-zinc-200/80 bg-white"
          : "border-violet-100 bg-white/90"
      }`}
    >
      {children}
    </div>
  );
}

export function DailyStatsLoadingState({ label }: { label: string }) {
  return (
    <StatsPanelShell>
      <div
        aria-busy="true"
        aria-live="polite"
        className="flex items-center gap-3 text-zinc-500"
        role="status"
      >
        <LoaderCircle
          aria-hidden="true"
          className="h-5 w-5 animate-spin text-violet-500"
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </StatsPanelShell>
  );
}

export function DailyStatsSignInState() {
  const { openLoginDialog } = useAuthDialog();

  return (
    <StatsPanelShell>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Personal Stats
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
            Sign in to view your stats
          </h2>
          <p className="mt-4 max-w-[42rem] text-base leading-7 text-zinc-500">
            Your Daily Challenge progress, best run, and last 7 days of history stay in sync with your OAuth account.
          </p>
        </div>
        <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 md:flex">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => openLoginDialog({ redirect: "/stats" })}
        className="mt-8 inline-flex rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
      >
        Sign in to continue
      </button>
    </StatsPanelShell>
  );
}

export function DailyStatsEmptyState() {
  return (
    <StatsPanelShell tone="soft">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
          Personal Stats
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
          Stats are not available yet
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-500">
          We could not load your Daily Challenge history right now. Please try again in a moment.
        </p>
      </div>
    </StatsPanelShell>
  );
}
