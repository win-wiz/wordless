import {
  buildWaffleEmojiBoard,
  buildWaffleShareText,
  type WaffleTileState,
} from "@/lib/waffle-game";
import type { WaffleDailyCommunityStats, WaffleDailyStats } from "@/types/waffle";

import { getWaffleAheadOfPlayers } from "@/components/iframes/waffle-game/waffle-client-helpers";
import type {
  WaffleApiResponse,
  WaffleMode,
  WaffleShareSnapshot,
} from "@/components/iframes/waffle-game/waffle-client-types";

type ResolvedShareSnapshot = {
  solved: boolean;
  stars: number;
  tileStates: WaffleTileState[];
};

type ShareStateInput = {
  communityStats: WaffleDailyCommunityStats | null;
  dailyStats: WaffleDailyStats | null;
  isShowingSolution: boolean;
  mode: WaffleMode;
  puzzle: WaffleApiResponse | null;
  shareSnapshot: WaffleShareSnapshot | null;
  solved: boolean;
  stars: number;
  tileStates: WaffleTileState[];
};

function resolveShareSnapshot({
  isShowingSolution,
  shareSnapshot,
  solved,
  stars,
  tileStates,
}: Pick<ShareStateInput, "isShowingSolution" | "shareSnapshot" | "solved" | "stars" | "tileStates">) {
  if (shareSnapshot) {
    return shareSnapshot;
  }

  return {
    solved: solved && !isShowingSolution,
    stars,
    tileStates,
  } satisfies ResolvedShareSnapshot;
}

export function buildDailyShareText(
  input: ShareStateInput & {
    baseUrl: string;
  },
) {
  const {
    baseUrl,
    communityStats,
    dailyStats,
    isShowingSolution,
    mode,
    puzzle,
    shareSnapshot,
    solved,
    stars,
    tileStates,
  } = input;

  if (!puzzle || mode !== "daily") {
    return "";
  }

  if (isShowingSolution && !shareSnapshot && !solved) {
    return "";
  }

  const snapshot = resolveShareSnapshot({
    isShowingSolution,
    shareSnapshot,
    solved,
    stars,
    tileStates,
  });
  const shareDetails: string[] = [];

  if (snapshot.solved && dailyStats?.currentStreak && dailyStats.currentStreak > 1) {
    shareDetails.push(`🔥 ${dailyStats.currentStreak}-day streak`);
  }

  if (snapshot.solved && communityStats?.totalCompleted) {
    shareDetails.push(
      `🌍 ${Math.round((communityStats.totalWins / communityStats.totalCompleted) * 100)}% solved today`,
    );
  }

  return buildWaffleShareText({
    details: shareDetails,
    emojiBoard: buildWaffleEmojiBoard(snapshot.tileStates),
    sequence: puzzle.sequence,
    solved: snapshot.solved,
    stars: snapshot.stars,
    url: baseUrl,
  });
}

export function buildWaffleShareSummary(input: ShareStateInput) {
  const { communityStats, dailyStats, mode, puzzle, shareSnapshot, stars } = input;

  if (mode !== "daily" || !puzzle) {
    return undefined;
  }

  const summaryStars = shareSnapshot?.stars ?? stars;
  const currentStreak = dailyStats?.currentStreak ?? 0;
  const aheadOfPlayers = getWaffleAheadOfPlayers(communityStats, summaryStars);

  return {
    eyebrow: summaryStars >= 4 ? "Worth Sharing" : "Daily Result",
    headline:
      summaryStars >= 5
        ? "This run is absolutely share-worthy."
        : summaryStars >= 3
          ? "A strong daily result is ready to post."
          : "Your daily result is locked in.",
    items: [
      {
        label: "Score",
        value: `${summaryStars}/5 stars`,
      },
      {
        label: "Ahead Of",
        value: aheadOfPlayers !== null ? `${aheadOfPlayers}% of players` : "Building",
      },
      {
        label: "Streak",
        value: currentStreak > 0 ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "Started",
      },
    ],
  };
}

export function buildWaffleSharePreviewCard(input: ShareStateInput) {
  const {
    communityStats,
    dailyStats,
    isShowingSolution,
    mode,
    puzzle,
    shareSnapshot,
    solved,
    stars,
    tileStates,
  } = input;

  if (mode !== "daily" || !puzzle) {
    return undefined;
  }

  const snapshot = resolveShareSnapshot({
    isShowingSolution,
    shareSnapshot,
    solved,
    stars,
    tileStates,
  });
  const previewHighlights: string[] = [];
  const aheadOfPlayers = getWaffleAheadOfPlayers(communityStats, snapshot.stars);
  const currentStreak = dailyStats?.currentStreak ?? 0;

  if (aheadOfPlayers !== null) {
    previewHighlights.push(`Ahead of ${aheadOfPlayers}% of players`);
  }

  if (currentStreak > 1) {
    previewHighlights.push(`${currentStreak}-day streak`);
  }

  if (communityStats?.totalCompleted) {
    previewHighlights.push(
      `${Math.round((communityStats.totalWins / communityStats.totalCompleted) * 100)}% solved today`,
    );
  }

  return {
    eyebrow: puzzle.sequence ? `Daily Waffle #${puzzle.sequence}` : "Daily Waffle",
    headline:
      snapshot.stars >= 5
        ? "A clean daily finish worth posting."
        : snapshot.stars >= 3
          ? "A strong Waffle run, ready to share."
          : "Today’s Waffle result, locked in.",
    emojiBoard: buildWaffleEmojiBoard(snapshot.tileStates),
    footerLabel: "Challenge friends",
    highlights: previewHighlights,
    recordLabel: puzzle.sequence ? `#waffle${puzzle.sequence}` : "#waffle",
    scoreLabel: snapshot.solved ? `${snapshot.stars}/5` : "X/5",
  };
}
