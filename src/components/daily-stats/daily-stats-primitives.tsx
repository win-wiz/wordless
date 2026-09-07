"use client";

import type { ReactNode } from "react";

export function SummaryStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 px-1 py-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
      <p className="text-[2rem] font-semibold leading-none tracking-[-0.05em] text-zinc-950">
        {value}
      </p>
      {hint ? (
        <p className="text-sm leading-6 text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function InsightRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
          {icon}
        </div>
        <span className="text-sm font-medium text-zinc-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-zinc-900">{value}</span>
    </div>
  );
}
