"use client";

import { cn } from "@/lib/utils";
import {
  ActionButtonSkeleton,
  WaffleGameFrame,
} from "@/components/waffle-game/waffle-game-ui";

type WaffleBoardSkeletonProps = {
  mode?: "daily" | "unlimited";
  preserveToolbarSpace?: boolean;
};

const WAFFLE_BOARD_MASK = [
  [true, true, true, true, true],
  [true, false, true, false, true],
  [true, true, true, true, true],
  [true, false, true, false, true],
  [true, true, true, true, true],
] as const;

export default function WaffleBoardSkeleton({
  mode = "daily",
  preserveToolbarSpace = true,
}: WaffleBoardSkeletonProps) {
  return (
    <WaffleGameFrame
      board={(
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
      )}
      footer={(
        <div
          className={cn(
            "gap-3",
            mode === "unlimited"
              ? "grid sm:grid-cols-2"
              : "flex flex-wrap items-center justify-center",
          )}
        >
          <ActionButtonSkeleton label="Undo" />
          {mode === "unlimited" ? (
            <ActionButtonSkeleton label="Reset Puzzle" wide />
          ) : null}
        </div>
      )}
      toolbar={preserveToolbarSpace ? <div aria-hidden="true" className="h-14 w-full max-w-[760px]" /> : undefined}
    />
  );
}
