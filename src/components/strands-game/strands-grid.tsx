"use client";

import { useCallback } from "react";

import { getSmoothPath, HEIGHT, pointKey, WIDTH } from "@/lib/strands-engine";
import { cn } from "@/lib/utils";
import type { FoundWord, StrandsPoint } from "@/types/strands";

type StrandsGridProps = {
  grid: string[][];
  foundWords: FoundWord[];
  currentPath: StrandsPoint[];
  errorPath: StrandsPoint[];
  hintCells: StrandsPoint[];
  occupiedCells: Map<string, boolean>;
  onCellPointerDown: (r: number, c: number) => void;
  onPointerMove: (event: { clientX: number; clientY: number; buttons: number }) => void;
};

export default function StrandsGrid({
  grid,
  foundWords,
  currentPath,
  errorPath,
  hintCells,
  occupiedCells,
  onCellPointerDown,
  onPointerMove,
}: StrandsGridProps) {
  const currentSet = new Set(currentPath.map(pointKey));
  const errorSet = new Set(errorPath.map(pointKey));
  const hintSet = new Set(hintCells.map(pointKey));

  const handleCellPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, r: number, c: number) => {
      // 释放指针捕获，否则后续 pointer 事件不会派发到其它格子元素
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // 某些浏览器在未捕获时抛出，忽略
      }
      event.preventDefault();
      onCellPointerDown(r, c);
    },
    [onCellPointerDown],
  );

  const handleContainerPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove(event);
    },
    [onPointerMove],
  );

  return (
    <div
      className="relative mx-auto aspect-[6/8] w-full max-w-[420px] touch-none select-none"
      onPointerMove={handleContainerPointerMove}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 600 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {foundWords.map((fw) => (
          <path
            key={fw.word}
            d={getSmoothPath(fw.path)}
            fill="none"
            stroke={fw.isSpangram ? "#facc15" : "#93c5fd"}
            strokeWidth={20}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
            pathLength={1}
            strokeDasharray={1}
            className="animate-path-draw"
            style={{ mixBlendMode: "multiply" }}
          />
        ))}
        {currentPath.length > 0 ? (
          <path
            d={getSmoothPath(currentPath)}
            fill="none"
            stroke={errorPath.length > 0 ? "#fca5a5" : "#d6d3d1"}
            strokeWidth={20}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
        ) : null}
        {errorPath.length > 0 ? (
          <path
            d={getSmoothPath(errorPath)}
            fill="none"
            stroke="#fca5a5"
            strokeWidth={20}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        ) : null}
      </svg>

      <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 gap-2 md:gap-3 lg:gap-3.5">
        {Array.from({ length: HEIGHT }, (_, r) =>
          Array.from({ length: WIDTH }, (_, c) => {
            const key = `${r},${c}`;
            const letter = grid[r]?.[c] ?? "";
            const foundSpangram = occupiedCells.get(key);
            const isFound = foundSpangram !== undefined;
            const isError = errorSet.has(key);
            const isHint = hintSet.has(key);
            const isCurrent = currentSet.has(key);

            return (
              <div
                key={key}
                data-strands-cell="true"
                data-row={r}
                data-col={c}
                onPointerDown={(event) => handleCellPointerDown(event, r, c)}
                className={cn(
                  "flex cursor-pointer items-center justify-center rounded-full border text-[22px] font-bold uppercase transition-all duration-300 md:text-[24px] lg:text-[26px]",
                  isError
                    ? "scale-90 border-red-300 bg-red-200 text-red-900"
                    : isFound
                      ? foundSpangram
                        ? "border-yellow-400 bg-yellow-300 text-yellow-900"
                        : "border-blue-300 bg-blue-200 text-blue-900"
                      : isCurrent
                        ? "scale-95 border-stone-300 bg-stone-300 text-stone-800"
                        : isHint
                          ? "scale-95 border-stone-200 bg-white text-stone-800 shadow-sm ring-2 ring-amber-400/60"
                          : "border-stone-200 bg-white text-stone-800 shadow-sm hover:scale-105 hover:bg-stone-100",
                )}
              >
                {letter}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
