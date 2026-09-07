"use client";

import { getWaffleTileStyle } from "@/components/iframes/waffle-game/waffle-tile-theme";
import { cn } from "@/lib/utils";
import type { WaffleTileState } from "@/lib/waffle-game";
import { memo, useMemo, type MutableRefObject, type ReactNode } from "react";

import type {
  SwapAnimation,
  WafflePlayableCellView,
} from "@/components/iframes/waffle-game/waffle-client-types";

function getTileStatePalette(state: WaffleTileState) {
  if (state === "green") {
    return "border-transparent shadow-[0_12px_24px_rgba(5,150,105,0.2)]";
  }

  if (state === "yellow") {
    return "border-transparent shadow-[0_12px_24px_rgba(217,119,6,0.18)]";
  }

  return "border-transparent shadow-[0_12px_24px_rgba(71,85,105,0.18)]";
}

function getTileClasses({
  changed,
  hiddenForSwap,
  selected,
  state,
}: {
  changed: boolean;
  hiddenForSwap: boolean;
  selected: boolean;
  state: WaffleTileState;
}) {
  return cn(
    "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border text-2xl font-bold uppercase",
    "shadow-sm transition duration-200 ease-out md:h-20 md:w-20",
    "hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2",
    getTileStatePalette(state),
    selected && "animate-waffle-select ring-4 ring-blue-300 ring-offset-2",
    changed && "animate-waffle-flash",
    hiddenForSwap && "pointer-events-none opacity-0",
  );
}

function AnimatedSwapTile({
  animation,
  letter,
  originX,
  originY,
  state,
  targetX,
  targetY,
}: {
  animation: SwapAnimation;
  letter: string;
  originX: number;
  originY: number;
  state: WaffleTileState;
  targetX: number;
  targetY: number;
}) {
  return (
    <div
      className={cn(
        "absolute flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl font-bold uppercase shadow-xl",
        "transition-transform duration-300 ease-out md:h-20 md:w-20",
        getTileStatePalette(state),
      )}
      style={{
        ...getWaffleTileStyle(state),
        transform: animation.active
          ? `translate(${targetX}px, ${targetY}px) scale(1.04)`
          : `translate(${originX}px, ${originY}px) scale(1)`,
      }}
    >
      {letter}
    </div>
  );
}

export const WaffleGameBoard = memo(function WaffleGameBoard({
  boardCells,
  boardRef,
  canInteractWithTiles,
  changedTileIndices,
  hiddenSwapIndices,
  isShowingSolution,
  onTileClick,
  selectedIndex,
  solved,
  swapAnimation,
  tileRefs,
}: {
  boardCells: Array<Array<WafflePlayableCellView | null>>;
  boardRef: MutableRefObject<HTMLDivElement | null>;
  canInteractWithTiles: boolean;
  changedTileIndices: number[];
  hiddenSwapIndices: Set<number>;
  isShowingSolution: boolean;
  onTileClick: (index: number) => void;
  selectedIndex: number | null;
  solved: boolean;
  swapAnimation: SwapAnimation | null;
  tileRefs: MutableRefObject<Record<number, HTMLButtonElement | null>>;
}) {
  const changedTileIndexSet = useMemo(() => new Set(changedTileIndices), [changedTileIndices]);

  return (
    <div
      className={cn(
        "rounded-[36px] border border-slate-200 bg-slate-50/90 px-6 py-7 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur md:px-8",
        solved && !isShowingSolution && "animate-waffle-solved",
      )}
    >
      <div
        ref={boardRef}
        className="relative mx-auto grid w-fit grid-cols-5 gap-3"
      >
        {boardCells.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) =>
            cell ? (
              <button
                key={`${rowIndex}-${colIndex}`}
                ref={(element) => {
                  tileRefs.current[cell.index] = element;
                }}
                aria-label={`Letter ${cell.letter.toUpperCase()}, ${cell.state}`}
                className={getTileClasses({
                  changed: changedTileIndexSet.has(cell.index),
                  hiddenForSwap: hiddenSwapIndices.has(cell.index),
                  selected: selectedIndex === cell.index,
                  state: cell.state,
                })}
                disabled={!canInteractWithTiles}
                onClick={() => onTileClick(cell.index)}
                style={getWaffleTileStyle(cell.state)}
                type="button"
              >
                <span className="relative z-10">{cell.letter}</span>
              </button>
            ) : (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="h-16 w-16 rounded-2xl bg-transparent md:h-20 md:w-20"
              />
            ),
          ),
        )}

        {swapAnimation ? (
          <div className="pointer-events-none absolute inset-0 z-20">
            <AnimatedSwapTile
              animation={swapAnimation}
              letter={swapAnimation.fromLetter}
              originX={swapAnimation.fromX}
              originY={swapAnimation.fromY}
              state={swapAnimation.fromState}
              targetX={swapAnimation.toX}
              targetY={swapAnimation.toY}
            />
            <AnimatedSwapTile
              animation={swapAnimation}
              letter={swapAnimation.toLetter}
              originX={swapAnimation.toX}
              originY={swapAnimation.toY}
              state={swapAnimation.toState}
              targetX={swapAnimation.fromX}
              targetY={swapAnimation.fromY}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
});

export function ActionButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-base font-medium transition",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-white text-slate-400"
          : "border-slate-200 bg-white text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-50 hover:text-slate-800",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function InfoToolbarPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-14 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="text-base font-semibold text-slate-700">{value}</span>
    </div>
  );
}
