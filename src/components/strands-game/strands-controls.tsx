"use client";

import Link from "next/link";
import { Lightbulb, Newspaper, Share2 } from "lucide-react";

import { HINT_METER_MAX } from "@/lib/strands-engine";
import { cn } from "@/lib/utils";

type StrandsControlsProps = {
  theme: string;
  hintMeter: number;
  articleSlug?: string | null;
  onUseHint: () => void;
  onShare: () => void;
};

export default function StrandsControls({
  theme,
  hintMeter,
  articleSlug,
  onUseHint,
  onShare,
}: StrandsControlsProps) {
  const hintReady = hintMeter >= HINT_METER_MAX;

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-3">
      <p className="text-center text-sm font-medium text-stone-600">
        <span className="mr-1 font-semibold uppercase tracking-wide text-stone-500">
          Theme:
        </span>
        <span className="text-base font-bold text-stone-800">{theme}</span>
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!hintReady}
          onClick={onUseHint}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-all duration-300",
            hintReady
              ? "border-amber-300 bg-amber-100 text-amber-900 shadow-sm hover:bg-amber-200"
              : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400",
          )}
        >
          <Lightbulb className="h-4 w-4" />
          Hint
          <span className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: HINT_METER_MAX }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-4 rounded-full transition-colors duration-300",
                  i < hintMeter ? "bg-amber-400" : "bg-stone-300",
                )}
              />
            ))}
          </span>
        </button>

        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-300 hover:bg-stone-100"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {articleSlug ? (
        <Link
          href={`/strands-game/article/${articleSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 underline-offset-4 transition-colors hover:text-stone-800 hover:underline"
        >
          <Newspaper className="h-4 w-4" />
          Today&apos;s hints &amp; answers
        </Link>
      ) : null}
    </div>
  );
}
