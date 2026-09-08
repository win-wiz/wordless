import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GameInfoPillProps = {
  className?: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

type GameInfoPillSkeletonProps = {
  className?: string;
  valueWidthClassName?: string;
};

const BASE_PILL_CLASS_NAME =
  "flex h-14 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur";

export function GameInfoPill({
  className,
  icon,
  label,
  value,
  valueClassName,
}: GameInfoPillProps) {
  return (
    <div className={cn(BASE_PILL_CLASS_NAME, className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="flex shrink-0 items-center justify-center text-slate-400">
        {icon}
      </span>
      <div className={cn("flex items-center text-base font-semibold text-slate-700", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

export function GameInfoPillSkeleton({
  className,
  valueWidthClassName = "w-[132px]",
}: GameInfoPillSkeletonProps) {
  return (
    <div className={cn(BASE_PILL_CLASS_NAME, "animate-pulse", className)}>
      <div className="h-4 w-4 shrink-0 rounded-full bg-slate-200/90" />
      <div className={cn("h-6 rounded-full bg-slate-200/90", valueWidthClassName)} />
    </div>
  );
}
