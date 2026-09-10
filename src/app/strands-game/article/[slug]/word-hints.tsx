"use client";

import { useState } from "react";
import { Eye, EyeOff, Lightbulb, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StrandsWordHint } from "@/types/strands";

// 0 = 仅提示文本；1 = 首字母 + 长度；2 = 完整答案
type RevealLevel = 0 | 1 | 2;

export function WordHints({ wordHints }: { wordHints: StrandsWordHint[] }) {
  // 以索引为 key：上游对答案词没有唯一性约束，用 word 做 key 时重复词会共享状态
  const [levels, setLevels] = useState<Record<number, RevealLevel>>({});

  const levelOf = (index: number): RevealLevel => levels[index] ?? 0;
  const allRevealed = wordHints.every((_, index) => levelOf(index) === 2);

  const setLevel = (index: number, level: RevealLevel) => {
    setLevels((prev) => ({ ...prev, [index]: level }));
  };

  const toggleAll = () => {
    if (allRevealed) {
      setLevels({});
    } else {
      setLevels(
        Object.fromEntries(wordHints.map((_, index) => [index, 2])),
      );
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-stone-800">Word hints</h2>
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
        >
          {allRevealed ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          {allRevealed ? "Hide all" : "Reveal all answers"}
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {wordHints.map((wordHint, index) => {
          const level = levelOf(index);
          const masked =
            wordHint.word.length > 1
              ? wordHint.word[0] +
                " " +
                Array.from({ length: wordHint.word.length - 1 }, () => "_").join(
                  " ",
                )
              : wordHint.word;

          return (
            <li
              key={index}
              className="rounded-2xl border border-stone-200 bg-white/90 px-5 py-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A6C8FF] text-xs font-bold text-stone-800">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-sm text-stone-600">
                    <Lightbulb className="mr-1.5 inline-block h-4 w-4 text-amber-500" />
                    {wordHint.hint}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {level === 1 && (
                      <span
                        aria-label={`${wordHint.word.length} letters, starts with ${wordHint.word[0]}`}
                        className="inline-block rounded-full border border-stone-300 bg-stone-100 px-3 py-1 font-mono text-xs font-bold tracking-[0.2em] text-stone-700"
                      >
                        <span aria-hidden="true">{masked}</span>
                      </span>
                    )}

                    {/* 答案常驻 DOM（CSS 模糊隐藏而非条件渲染），保证 SEO 可索引；
                        未揭示时禁选禁点，避免框选/复制泄露 */}
                    <span
                      aria-hidden={level !== 2}
                      className={cn(
                        "inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide transition",
                        level === 2
                          ? "bg-[#A6C8FF] text-stone-800"
                          : "pointer-events-none select-none bg-stone-200 text-stone-600",
                        level !== 2 && "blur-md",
                      )}
                    >
                      {wordHint.word}
                    </span>

                    {level === 0 && (
                      <button
                        type="button"
                        onClick={() => setLevel(index, 1)}
                        className="inline-flex items-center gap-2 rounded-full border border-dashed border-stone-300 px-3 py-1 text-xs font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Tap for a clue
                      </button>
                    )}

                    {level === 1 && (
                      <button
                        type="button"
                        onClick={() => setLevel(index, 2)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-300 px-3 py-1 text-xs font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Tap to reveal answer
                      </button>
                    )}

                    {level === 2 && (
                      <button
                        type="button"
                        onClick={() => setLevel(index, 0)}
                        aria-label={`Hide answer for word ${index + 1}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
