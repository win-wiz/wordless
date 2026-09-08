"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FoundWord } from "@/types/strands";

type FoundWordsListProps = {
  foundWords: FoundWord[];
  isWon: boolean;
  onRemoveWord: (word: string) => void;
  className?: string;
};

export default function FoundWordsList({
  foundWords,
  isWon,
  onRemoveWord,
  className,
}: FoundWordsListProps) {
  if (foundWords.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-[420px] flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      {foundWords.map((fw) => (
        <span
          key={fw.word}
          className={cn(
            "group relative inline-flex items-center rounded-full px-3 py-1 text-sm font-bold tracking-wide text-stone-800",
          )}
          style={{ backgroundColor: fw.isSpangram ? "#F9DF6D" : "#A6C8FF" }}
        >
          {fw.word}
          {!isWon ? (
            <button
              type="button"
              aria-label={`Remove ${fw.word}`}
              onClick={() => onRemoveWord(fw.word)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-700 text-white shadow-sm transition-colors hover:bg-stone-900 sm:hidden sm:group-hover:flex"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}
