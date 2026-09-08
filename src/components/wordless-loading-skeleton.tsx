"use client";

import { GameInfoPillSkeleton } from "@/components/game-info-pill";
import { cn } from "@/lib/utils";
import type { GameMode } from "@/hooks/use-wordless-game";

type WordlessLoadingSkeletonProps = {
  columns: number;
  gameMode: GameMode;
  showKeyboard: boolean;
};

const WORDLESS_ROWS = 6;

export function WordlessLoadingSkeleton({
  columns,
  gameMode,
  showKeyboard,
}: WordlessLoadingSkeletonProps) {
  return (
    <>
      <div className="mb-7 flex w-full justify-center">
        <div className="flex w-full max-w-[640px] flex-wrap items-center justify-center gap-2">
          {gameMode === "unlimited" ? (
            <div className="flex h-12 items-center rounded-full border border-violet-100/80 bg-white/90 px-3 shadow-[0_10px_30px_rgba(139,92,246,0.08)] backdrop-blur">
              <div className="flex h-9 items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-violet-100" />
                <div className="h-6 w-10 animate-pulse rounded-full bg-violet-100" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-violet-100" />
              </div>
            </div>
          ) : (
            <GameInfoPillSkeleton
              className="h-12 border-violet-100/80 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]"
              valueWidthClassName="w-[132px]"
            />
          )}

          <GameInfoPillSkeleton
            className="h-12 border-violet-100/80 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]"
            valueWidthClassName="w-[96px]"
          />

          {gameMode === "unlimited" ? (
            <div className="h-12 w-12 animate-pulse rounded-full border border-violet-100/80 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]" />
          ) : null}
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <div
          className="mb-8 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: WORDLESS_ROWS * columns }, (_, index) => (
            <div
              key={index}
              className={cn(
                "flex h-14 w-14 animate-pulse items-center justify-center rounded-md border border-violet-200/50 bg-white",
                index % columns === 0 && "shadow-[0_0_0_1px_rgba(139,92,246,0.04)]",
              )}
            />
          ))}
        </div>

        {showKeyboard ? (
          <div className="mt-5 flex w-full max-w-[560px] flex-col justify-center space-y-2">
            <div className="mx-auto h-5 w-36 animate-pulse rounded-full bg-violet-100/80" />
            {[10, 9, 7].map((count, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1 md:gap-2">
                {rowIndex === 2 ? (
                  <div className="h-8 w-14 animate-pulse rounded-md border border-violet-100 bg-violet-100/60 md:h-14 md:w-20" />
                ) : null}
                {Array.from({ length: count }, (_, keyIndex) => (
                  <div
                    key={keyIndex}
                    className="h-8 w-8 animate-pulse rounded-md border border-violet-100 bg-white md:h-14 md:w-14"
                  />
                ))}
                {rowIndex === 2 ? (
                  <div className="h-8 w-14 animate-pulse rounded-md border border-violet-100 bg-violet-200/70 md:h-14 md:w-20" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
