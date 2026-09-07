import { getPlayableCells, type WaffleTileState } from "@/lib/waffle-game";
import type { WaffleDailyCommunityStats, WaffleDailyProgressResponse } from "@/types/waffle";

import type {
  WaffleApiResponse,
  WafflePlayableCellView,
} from "@/components/iframes/waffle-game/waffle-client-types";

const PLAYABLE_CELLS = getPlayableCells();

export function getChangedIndices(
  previousLetters: string[],
  nextLetters: string[],
  priorityIndices: number[] = [],
) {
  const changed = new Set<number>(priorityIndices);

  previousLetters.forEach((letter, index) => {
    if (letter !== nextLetters[index]) {
      changed.add(index);
    }
  });

  return [...changed];
}

export function buildBoardCells(currentLetters: string[], tileStates: WaffleTileState[]) {
  const byCoordinate = new Map<string, WafflePlayableCellView>();

  PLAYABLE_CELLS.forEach((cell) => {
    byCoordinate.set(`${cell.row}-${cell.col}`, {
      index: cell.index,
      letter: currentLetters[cell.index] ?? "",
      state: tileStates[cell.index] ?? "gray",
    });
  });

  return Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => byCoordinate.get(`${row}-${col}`) ?? null),
  );
}

export function restoreProgressFromResponse(
  progress: WaffleDailyProgressResponse,
  puzzle: WaffleApiResponse,
) {
  if (progress.record && progress.record.puzzleId === puzzle.id) {
    return {
      completed: true,
      currentLetters: progress.record.isWin ? puzzle.solutionLetters : puzzle.solutionLetters,
      revealed: !progress.record.isWin,
      swapsUsed: progress.record.swapsUsed,
      totalTime: progress.record.totalTime,
    };
  }

  if (!progress.session || progress.session.puzzleId !== puzzle.id) {
    return null;
  }

  return {
    completed: progress.session.completed,
    currentLetters: progress.session.currentLetters,
    revealed: progress.session.revealed,
    swapsUsed: progress.session.swapsUsed,
    totalTime: progress.session.totalTime,
  };
}

export function getWaffleAheadOfPlayers(
  communityStats: WaffleDailyCommunityStats | null,
  stars: number,
) {
  if (!communityStats || communityStats.totalCompleted <= 0) {
    return null;
  }

  return Math.max(
    0,
    Math.min(
      99,
      Math.round(
        ((communityStats.failedCount +
          communityStats.starDistribution
            .slice(0, Math.max(0, Math.min(stars, communityStats.starDistribution.length)))
            .reduce((sum, count) => sum + count, 0)) /
          communityStats.totalCompleted) *
          100,
      ),
    ),
  );
}
