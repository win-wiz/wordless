"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildRemovedTileIdsFromClearedWords,
  buildSelectedWord,
  getExposedTiles,
  getSolvableWords,
  isPuzzleSolved,
  submitSelectedTiles,
  trimSelectedTileIds,
  toggleSelectedTile,
} from "@/lib/stack-game";
import type { StackPuzzlePayload } from "@/types/stack";

type StackClientProps = {
  puzzle: StackPuzzlePayload;
};

const OPENING_MESSAGE = "Tap an exposed tile to lift it out of the stack.";
const DEPTH_ROW_SHIFT = [-8.5, 8, -7, 7.5, -6, 6.5] as const;
const DEPTH_TILT = [-2.8, 2.1, -1.8, 1.7, -1.4, 1.2] as const;

function getBoardTileState({
  exposedTileIds,
  removedTileIds,
  selectedTileIds,
  tileId,
}: {
  exposedTileIds: Set<string>;
  removedTileIds: Set<string>;
  selectedTileIds: Set<string>;
  tileId: string;
}) {
  if (removedTileIds.has(tileId)) {
    return "cleared";
  }

  if (selectedTileIds.has(tileId)) {
    return "lifted";
  }

  if (exposedTileIds.has(tileId)) {
    return "exposed";
  }

  return "blocked";
}

function getTileClasses(state: "blocked" | "cleared" | "exposed" | "lifted") {
  if (state === "cleared") {
    return "pointer-events-none scale-90 border-[#1f5b48]/20 bg-[#10392d]/0 text-transparent opacity-0";
  }

  if (state === "lifted") {
    return "pointer-events-none scale-95 border-[#d3c7a3]/10 bg-[#d3c7a3]/0 text-transparent opacity-0";
  }

  if (state === "exposed") {
    return "cursor-pointer border-[#696659] bg-[linear-gradient(180deg,#37352f_0%,#24231f_100%)] text-[#e3dbbb] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0.45rem_0_#090909,0_1.2rem_2.2rem_rgba(0,0,0,0.34)] hover:-translate-y-0.5 hover:border-[#8b886f] hover:text-[#f2ebcd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8cfae] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2f24]";
  }

  return "cursor-default border-[#45433c] bg-[linear-gradient(180deg,#2c2b26_0%,#1d1c19_100%)] text-[#c4bb98] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_0.45rem_0_#090909,0_1.2rem_2rem_rgba(0,0,0,0.26)]";
}

function getTilePosition(depth: number, layerIndex: number, wordCount: number) {
  const spread = (layerIndex - 2) * 15.2;
  const rowShift = DEPTH_ROW_SHIFT[depth % DEPTH_ROW_SHIFT.length] ?? 0;
  const depthTilt = DEPTH_TILT[depth % DEPTH_TILT.length] ?? 0;
  const rotation = depthTilt + (layerIndex - 2) * 0.8;
  const topOffset = wordCount <= 1 ? 50 : 10 + depth * (56 / (wordCount - 1));

  return {
    left: `calc(50% + ${spread + rowShift}%)`,
    top: `${topOffset}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    zIndex: (wordCount - depth) * 10 + (5 - layerIndex),
  } as const;
}

export default function StackClient({ puzzle }: StackClientProps) {
  const [clearedWordIds, setClearedWordIds] = useState<string[]>([]);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [message, setMessage] = useState(OPENING_MESSAGE);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimerRef = useRef<number | null>(null);

  const removedTileIds = useMemo(
    () => buildRemovedTileIdsFromClearedWords(puzzle, clearedWordIds),
    [puzzle, clearedWordIds],
  );
  const activeHiddenTileIds = useMemo(
    () => [...removedTileIds, ...selectedTileIds],
    [removedTileIds, selectedTileIds],
  );

  const exposedTiles = useMemo(
    () => getExposedTiles(puzzle, activeHiddenTileIds),
    [activeHiddenTileIds, puzzle],
  );
  const readyWords = useMemo(
    () => getSolvableWords(puzzle, removedTileIds),
    [puzzle, removedTileIds],
  );
  const currentWord = readyWords[0] ?? null;
  const exposedTileIds = useMemo(
    () => new Set(exposedTiles.map((tile) => tile.id)),
    [exposedTiles],
  );
  const removedTileIdSet = useMemo(
    () => new Set(removedTileIds),
    [removedTileIds],
  );
  const selectedTileIdSet = useMemo(
    () => new Set(selectedTileIds),
    [selectedTileIds],
  );
  const selectedWord = buildSelectedWord(puzzle, selectedTileIds);
  const selectedTiles = useMemo(
    () =>
      selectedTileIds.map(
        (tileId) => puzzle.tiles.find((tile) => tile.id === tileId) ?? null,
      ),
    [puzzle.tiles, selectedTileIds],
  );
  const solved = isPuzzleSolved(puzzle, removedTileIds);
  const clearedWordCount = clearedWordIds.length;

  const stopReplay = useCallback(() => {
    if (replayTimerRef.current) {
      window.clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }

    setIsReplaying(false);
  }, []);

  useEffect(() => () => stopReplay(), [stopReplay]);

  function handleTileClick(tileId: string) {
    if (solved || isReplaying) {
      return;
    }

    setSelectedTileIds((current) =>
      toggleSelectedTile(puzzle, current, tileId, removedTileIds),
    );
  }

  const handleSelectedTileClick = useCallback(
    (tileId: string) => {
      if (solved || isReplaying) {
        return;
      }

      setSelectedTileIds((current) => trimSelectedTileIds(current, tileId));
      setMessage("Returned picked letters to the stack.");
    },
    [isReplaying, solved],
  );

  const handleSubmit = useCallback(() => {
    if (solved || isReplaying) {
      return false;
    }

    const result = submitSelectedTiles(puzzle, selectedTileIds, removedTileIds);
    setSelectedTileIds(result.nextSelectedTileIds);

    if (result.kind === "incomplete") {
      setMessage("Pick five exposed letters before submitting.");
      return false;
    }

    if (result.kind === "invalid") {
      setMessage(
        "That combination does not advance the puzzle. Try a different path.",
      );
      return false;
    }

    setClearedWordIds((current) => [...current, result.solvedWord.id]);

    if (isPuzzleSolved(puzzle, result.nextRemovedTileIds)) {
      setMessage(
        `Stack cleared. ${result.solvedWord.word.toUpperCase()} finished the puzzle.`,
      );
      return true;
    }

    setMessage(
      `${result.solvedWord.word.toUpperCase()} cleared. The next layer is ready.`,
    );
    return true;
  }, [isReplaying, puzzle, removedTileIds, selectedTileIds, solved]);

  const handleResetSelection = useCallback(() => {
    if (isReplaying) {
      return;
    }

    setSelectedTileIds([]);
    setMessage(OPENING_MESSAGE);
  }, [isReplaying]);

  const handleUndo = useCallback(() => {
    if (isReplaying || clearedWordIds.length === 0) {
      return;
    }

    setSelectedTileIds([]);
    setClearedWordIds((current) => current.slice(0, -1));
    setMessage("Undid the most recently cleared word.");
  }, [clearedWordIds.length, isReplaying]);

  const handleRestart = useCallback(() => {
    stopReplay();
    setSelectedTileIds([]);
    setClearedWordIds([]);
    setMessage(OPENING_MESSAGE);
  }, [stopReplay]);

  const handleReplay = useCallback(() => {
    if (isReplaying || clearedWordIds.length === 0) {
      return;
    }

    const replaySequence = [...clearedWordIds];
    setSelectedTileIds([]);
    setClearedWordIds([]);
    setIsReplaying(true);
    setMessage("Replaying cleared layers...");

    const playStep = (index: number) => {
      if (index >= replaySequence.length) {
        replayTimerRef.current = null;
        setIsReplaying(false);
        setMessage("Replay finished.");
        return;
      }

      const nextWordId = replaySequence[index]!;
      const nextWord = puzzle.words.find((word) => word.id === nextWordId);
      setClearedWordIds(replaySequence.slice(0, index + 1));
      setMessage(`Replay: ${nextWord?.word.toUpperCase() ?? "WORD"} cleared.`);
      replayTimerRef.current = window.setTimeout(
        () => playStep(index + 1),
        420,
      );
    };

    replayTimerRef.current = window.setTimeout(() => playStep(0), 220);
  }, [clearedWordIds, isReplaying, puzzle.words]);

  useEffect(() => {
    if (isReplaying || selectedTileIds.length !== 5 || solved) {
      return;
    }

    const timer = window.setTimeout(() => {
      handleSubmit();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [handleSubmit, isReplaying, selectedTileIds.length, solved]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
        return;
      }

      if (event.key === "Escape" || event.key === "Backspace") {
        event.preventDefault();
        const lastSelectedTileId = selectedTileIds[selectedTileIds.length - 1];

        if (lastSelectedTileId) {
          handleSelectedTileClick(lastSelectedTileId);
          return;
        }

        handleResetSelection();
        return;
      }

      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();

        if (solved || clearedWordIds.length > 0) {
          handleReplay();
          return;
        }

        handleRestart();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    clearedWordIds.length,
    handleReplay,
    handleResetSelection,
    handleRestart,
    handleSelectedTileClick,
    handleSubmit,
    handleUndo,
    selectedTileIds,
    solved,
  ]);

  return (
    <div className="space-y-8 text-[#efe7c7]">
      <div className="space-y-3 text-center lg:text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-[#8bb4a3]">
          Stack
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#f5eed3] sm:text-4xl">
          Pull letters out of the pile, one word at a time.
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-[#a8c3b7] lg:mx-0">
          Only exposed tiles can be picked. Every correct 5-letter word clears a
          layer and reveals the next one underneath.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6 rounded-[2rem] border border-[#174536] bg-[radial-gradient(circle_at_top,#0f4e3b_0%,#072e24_42%,#041f18_100%)] p-4 shadow-[0_32px_80px_rgba(0,0,0,0.32)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#84ae9d]">
                Puzzle
              </p>
              <p className="mt-1 text-lg font-medium text-[#f6efcf]">
                {puzzle.title ?? puzzle.slug}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2b5f4d] bg-[#0a3328]/80 px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-[#d7cfab]">
              <span>{puzzle.difficulty}</span>
              <span className="text-[#5f8b79]">/</span>
              <span>
                {clearedWordCount}/{puzzle.wordCount}
              </span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#184a3a] bg-[#052820]/75 p-4 sm:p-5">
            <div className="mx-auto grid max-w-[27rem] grid-cols-5 gap-2 sm:gap-3">
              {Array.from({ length: 5 }, (_, index) => {
                const tile = selectedTiles[index];

                return (
                  <button
                    key={`slot-${index}`}
                    className={`flex aspect-square items-center justify-center rounded-[1.2rem] border text-2xl font-semibold uppercase tracking-[0.08em] transition duration-200 motion-reduce:transition-none ${
                      tile
                        ? "border-[#d8cda7]/70 bg-[linear-gradient(180deg,#3b3933_0%,#2a2924_100%)] text-[#f6efcf] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0.28rem_0_#090909,0_0.9rem_1.5rem_rgba(0,0,0,0.25)] hover:-translate-y-0.5"
                        : "border-dashed border-[#2b5e4d] bg-[#0b3328]/55 text-[#4d7565]"
                    }`}
                    disabled={!tile || isReplaying}
                    onClick={() => tile && handleSelectedTileClick(tile.id)}
                    type="button"
                  >
                    {tile?.char ?? ""}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7ea796]">
                  Current pick
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-[0.22em] text-[#f6efcf]">
                  {(selectedWord || "_____").toUpperCase()}
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-[0.18em] text-[#87ad9d]">
                <div>{selectedTileIds.length}/5 picked</div>
                <div>{exposedTiles.length} exposed</div>
              </div>
            </div>

            <div className="relative mx-auto mt-5 w-full max-w-[31rem] overflow-hidden rounded-[1.9rem] border border-[#134233] bg-[radial-gradient(circle_at_50%_30%,rgba(8,62,48,0.95),rgba(4,27,21,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_70px_rgba(0,0,0,0.28)] sm:p-5">
              <div className="relative aspect-[1/1.08]">
                {puzzle.tiles.map((tile) => {
                  const state = getBoardTileState({
                    exposedTileIds,
                    removedTileIds: removedTileIdSet,
                    selectedTileIds: selectedTileIdSet,
                    tileId: tile.id,
                  });

                  return (
                    <button
                      key={tile.id}
                      aria-label={`Layer ${tile.depth + 1} tile ${tile.charIndex + 1}: ${tile.char}`}
                      className={`absolute flex h-[4.3rem] w-[4.3rem] items-center justify-center rounded-[1.2rem] border text-[2rem] font-semibold uppercase transition-[transform,opacity,box-shadow,border-color,color,background-color] duration-200 ease-out motion-reduce:transition-none sm:h-[5.25rem] sm:w-[5.25rem] ${getTileClasses(state)}`}
                      disabled={state !== "exposed" || isReplaying}
                      onClick={() => handleTileClick(tile.id)}
                      style={getTilePosition(
                        tile.depth,
                        tile.layerIndex,
                        puzzle.wordCount,
                      )}
                      type="button"
                    >
                      {tile.char}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="rounded-full border border-[#d7cdab] bg-[#d7cdab] px-4 py-2 text-sm font-medium text-[#10271f] transition hover:bg-[#ebe2c0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ebca] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06271e]"
                onClick={handleSubmit}
                type="button"
              >
                Submit
              </button>
              <button
                className="rounded-full border border-[#316552] px-4 py-2 text-sm text-[#e7dec0] transition hover:border-[#628c7c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ebca] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06271e]"
                onClick={handleResetSelection}
                type="button"
              >
                Clear
              </button>
              <button
                className="rounded-full border border-[#316552] px-4 py-2 text-sm text-[#e7dec0] transition hover:border-[#628c7c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ebca] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06271e] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={clearedWordIds.length === 0 || isReplaying}
                onClick={handleUndo}
                type="button"
              >
                Undo
              </button>
              <button
                className="rounded-full border border-[#316552] px-4 py-2 text-sm text-[#e7dec0] transition hover:border-[#628c7c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ebca] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06271e] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={clearedWordIds.length === 0 || isReplaying}
                onClick={handleReplay}
                type="button"
              >
                Replay
              </button>
              <button
                className="rounded-full border border-[#316552] px-4 py-2 text-sm text-[#e7dec0] transition hover:border-[#628c7c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ebca] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06271e]"
                onClick={handleRestart}
                type="button"
              >
                Restart
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#7ea796]">
              Picked tiles leave the stack immediately, so deeper letters can
              surface while you build the word. Hotkeys:{" "}
              <span className="text-[#f1ebc9]">Enter</span> submit,
              <span className="text-[#f1ebc9]"> Backspace</span> return last
              tile,
              <span className="text-[#f1ebc9]"> Z</span> undo,
              <span className="text-[#f1ebc9]"> R</span> replay or restart.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#174536] bg-[#06271f]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#7ea796]">
              Status
            </p>
            <p className="mt-3 text-sm leading-6 text-[#e7dfbf]">{message}</p>
          </div>

          <div className="rounded-[1.75rem] border border-[#174536] bg-[#06271f]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#7ea796]">
              Current Layer
            </p>
            <p className="mt-3 text-lg font-medium text-[#f6efcf]">
              {solved
                ? "All layers cleared"
                : (currentWord?.clue ?? "Waiting for the next layer")}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#98baa9]">
              {solved
                ? "The full stack is gone."
                : `Step ${currentWord ? currentWord.orderIndex + 1 : clearedWordCount + 1} of ${puzzle.wordCount}`}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[#174536] bg-[#06271f]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#7ea796]">
              Progress
            </p>
            <div className="mt-3 space-y-2 text-sm text-[#e7dfbf]">
              <div className="flex items-center justify-between">
                <span>Words cleared</span>
                <span>
                  {clearedWordCount}/{puzzle.wordCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ready words</span>
                <span>{readyWords.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>State</span>
                <span>
                  {isReplaying
                    ? "Replaying"
                    : solved
                      ? "Solved"
                      : "In progress"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#174536] bg-[#06271f]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#7ea796]">
              Layers
            </p>
            <div className="mt-4 space-y-3">
              {[...puzzle.words]
                .sort((left, right) => left.orderIndex - right.orderIndex)
                .map((word) => {
                  const isCleared = word.tileIds.every((tileId) =>
                    removedTileIdSet.has(tileId),
                  );
                  const isCurrent = currentWord?.id === word.id;

                  return (
                    <div
                      key={word.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        isCleared
                          ? "border-[#4d8c73] bg-[#13382d]"
                          : isCurrent
                            ? "border-[#d7cdab]/40 bg-[#2f3126]"
                            : "border-[#1e4b3b] bg-[#082d23]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[#80a998]">
                            Step {word.orderIndex + 1}
                          </p>
                          <p className="mt-1 text-sm text-[#efe7c7]">
                            {word.clue}
                          </p>
                        </div>
                        <div className="text-xs uppercase tracking-[0.18em] text-[#90b3a4]">
                          {isCleared
                            ? "Cleared"
                            : isCurrent
                              ? "Active"
                              : "Waiting"}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
