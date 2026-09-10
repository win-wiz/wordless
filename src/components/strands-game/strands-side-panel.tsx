"use client";

import Link from "next/link";
import { CalendarDays, Lightbulb, Newspaper, Share2 } from "lucide-react";

import { HINT_METER_MAX } from "@/lib/strands-engine";
import { cn } from "@/lib/utils";
import FoundWordsList from "@/components/strands-game/found-words-list";
import type { FoundWord } from "@/types/strands";

type StrandsSidePanelProps = {
  articleSlug: string | null;
  dateLabel: string;
  foundWords: FoundWord[];
  hintMeter: number;
  isPractice: boolean;
  isWon: boolean;
  theme: string;
  totalWords: number;
  onRemoveWord: (word: string) => void;
  onShare: () => void;
  onUseHint: () => void;
};

export default function StrandsSidePanel({
  articleSlug,
  dateLabel,
  foundWords,
  hintMeter,
  isPractice,
  isWon,
  theme,
  totalWords,
  onRemoveWord,
  onShare,
  onUseHint,
}: StrandsSidePanelProps) {
  const hintReady = hintMeter >= HINT_METER_MAX;

  return (
    <section className="flex w-full max-w-[420px] flex-col gap-5 lg:h-full lg:max-w-none">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {isPractice ? "Practice" : dateLabel}
        </span>
        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
          {foundWords.length}/{totalWords} found
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
          {isPractice ? "Practice theme" : "Today's theme"}
        </span>
        <p className="text-xl font-bold leading-snug text-stone-800">{theme}</p>
        <div className="mt-1 flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: totalWords }, (_, i) => {
            const found = foundWords[i];
            return (
              <span
                key={i}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors duration-300",
                  found ? "" : "border border-stone-300",
                )}
                style={
                  found
                    ? { backgroundColor: found.isSpangram ? "#F9DF6D" : "#A6C8FF" }
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto py-2">
        {foundWords.length > 0 ? (
          <FoundWordsList
            foundWords={foundWords}
            isWon={isWon}
            onRemoveWord={onRemoveWord}
            className="max-w-none"
          />
        ) : null}
      </div>

      <div className="mt-auto flex items-center gap-3">
        <button
          type="button"
          disabled={!hintReady}
          onClick={onUseHint}
          className={cn(
            "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-300",
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

        {isWon ? (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-300 hover:bg-stone-100"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        ) : null}
      </div>

      {articleSlug ? (
        <Link
          href={`/strands-game/article/${articleSlug}`}
          className="inline-flex items-center gap-1.5 border-t border-stone-200 pt-4 text-sm font-medium text-stone-500 underline-offset-4 transition-colors hover:text-stone-800 hover:underline"
        >
          <Newspaper className="h-4 w-4" />
          Today&apos;s hints &amp; answers
        </Link>
      ) : null}
    </section>
  );
}

export function StrandsSidePanelSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="flex w-full max-w-[420px] flex-col gap-5 lg:h-full lg:max-w-none"
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 animate-pulse rounded-full bg-stone-200" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-stone-200" />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-stone-200" />
        <div className="h-7 w-48 animate-pulse rounded-full bg-stone-200" />
        <div className="mt-1 flex items-center gap-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-stone-200"
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 py-2" />

      <div className="mt-auto flex items-center gap-3">
        <div className="h-11 flex-1 animate-pulse rounded-full bg-stone-200" />
      </div>

      <div className="border-t border-stone-200 pt-4">
        <div className="h-4 w-44 animate-pulse rounded-full bg-stone-200" />
      </div>
    </section>
  );
}
