"use client";

import { GameInfoPillSkeleton } from "@/components/game-info-pill";
import { cn } from "@/lib/utils";

type WaffleLoadingSkeletonProps = {
  mode?: "daily" | "unlimited";
  standalone?: boolean;
};

const WAFFLE_BOARD_MASK = [
  [true, true, true, true, true],
  [true, false, true, false, true],
  [true, true, true, true, true],
  [true, false, true, false, true],
  [true, true, true, true, true],
] as const;

export default function WaffleLoadingSkeleton({
  mode = "daily",
  standalone = false,
}: WaffleLoadingSkeletonProps) {
  const content = (
    <>
      <div className="flex flex-1 flex-col items-center py-10">
        <div className="flex min-h-[720px] w-full flex-col items-center">
          <div className="mb-8 flex w-full justify-center">
            <div className="flex w-full max-w-[760px] flex-wrap items-center justify-center gap-3">
              <GameInfoPillSkeleton valueWidthClassName="w-[132px]" />
              <GameInfoPillSkeleton valueWidthClassName="w-[72px]" />
              {mode === "unlimited" ? (
                <div className="h-12 w-[118px] animate-pulse rounded-full border border-slate-200 bg-white/90 shadow-[0_10px_24px_rgba(15,23,42,0.06)]" />
              ) : null}
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-slate-50/90 px-6 py-7 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur md:px-8">
            <div className="mx-auto grid w-fit grid-cols-5 gap-3">
              {WAFFLE_BOARD_MASK.flatMap((row, rowIndex) =>
                row.map((hasTile, colIndex) =>
                  hasTile ? (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="h-16 w-16 animate-pulse rounded-2xl bg-slate-200/80 shadow-[0_12px_24px_rgba(71,85,105,0.12)] md:h-20 md:w-20"
                    />
                  ) : (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="h-16 w-16 rounded-2xl bg-transparent md:h-20 md:w-20"
                    />
                  ),
                ),
              )}
            </div>
          </div>

          <div
            className={cn(
              "mt-6 w-full max-w-[760px] gap-3",
              mode === "unlimited"
                ? "grid sm:grid-cols-2"
                : "flex flex-wrap items-center justify-center",
            )}
          >
            <div className="h-14 w-[168px] animate-pulse rounded-2xl border border-slate-200 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.04)]" />
            {mode === "daily" ? (
              <div className="h-14 w-[168px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50/90 shadow-[0_8px_24px_rgba(15,23,42,0.04)]" />
            ) : (
              <div className="h-14 w-full animate-pulse rounded-2xl border border-slate-200 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.04)]" />
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (!standalone) {
    return content;
  }

  return (
    <div className="container mx-auto flex min-h-[720px] max-w-screen-lg flex-col">
      {content}
    </div>
  );
}
