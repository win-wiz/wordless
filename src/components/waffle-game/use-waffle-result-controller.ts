"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";

import {
  buildDailyShareText,
  buildWaffleSharePreviewCard,
  buildWaffleShareSummary,
} from "@/components/waffle-game/waffle-client-share";
import type {
  WaffleApiResponse,
  WaffleMode,
  WaffleShareSnapshot,
} from "@/components/waffle-game/waffle-client-types";
import type { WaffleTileState } from "@/lib/waffle-game";
import type { WaffleDailyCommunityStats, WaffleDailyStats } from "@/types/waffle";

const CONFETTI_DURATION_MS = 3200;

type UseWaffleResultControllerParams = {
  communityStats: WaffleDailyCommunityStats | null;
  dailyStats: WaffleDailyStats | null;
  isShowingSolution: boolean;
  isStatsDialogOpen: boolean;
  mode: WaffleMode;
  onOpenStats: () => void;
  puzzle: WaffleApiResponse | null;
  savedRecordExists: boolean;
  solved: boolean;
  stars: number;
  suppressAutoResultPromptRef: MutableRefObject<boolean>;
  tileStates: WaffleTileState[];
};

export function useWaffleResultController({
  communityStats,
  dailyStats,
  isShowingSolution,
  isStatsDialogOpen,
  mode,
  onOpenStats,
  puzzle,
  savedRecordExists,
  solved,
  stars,
  suppressAutoResultPromptRef,
  tileStates,
}: UseWaffleResultControllerParams) {
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareSnapshot, setShareSnapshot] = useState<WaffleShareSnapshot | null>(null);
  const [resultPromptOpen, setResultPromptOpen] = useState(false);

  const confettiTimeoutRef = useRef<number | null>(null);
  const previousSolvedRef = useRef(false);

  const clearConfettiTimeout = useCallback(() => {
    if (confettiTimeoutRef.current !== null) {
      window.clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
  }, []);

  const resetResultState = useCallback(() => {
    clearConfettiTimeout();
    setIsConfettiActive(false);
    setShareDialogOpen(false);
    setShareSnapshot(null);
    setResultPromptOpen(false);
    previousSolvedRef.current = false;
  }, [clearConfettiTimeout]);

  const invalidateShareSnapshot = useCallback(() => {
    setShareSnapshot(null);
  }, []);

  useEffect(() => () => clearConfettiTimeout(), [clearConfettiTimeout]);

  useEffect(() => {
    if (!solved || isShowingSolution || previousSolvedRef.current) {
      previousSolvedRef.current = solved;
      return;
    }

    clearConfettiTimeout();
    setIsConfettiActive(true);
    confettiTimeoutRef.current = window.setTimeout(() => {
      confettiTimeoutRef.current = null;
      setIsConfettiActive(false);
    }, CONFETTI_DURATION_MS);
    toast.success(stars > 0 ? `Solved with ${stars} stars.` : "Puzzle solved.");
    setShareSnapshot({
      solved: true,
      stars,
      tileStates,
    });

    if (!suppressAutoResultPromptRef.current) {
      setResultPromptOpen(true);
    }

    previousSolvedRef.current = true;
  }, [clearConfettiTimeout, isShowingSolution, solved, stars, suppressAutoResultPromptRef, tileStates]);

  useEffect(() => {
    if (isStatsDialogOpen && resultPromptOpen) {
      setResultPromptOpen(false);
    }
  }, [isStatsDialogOpen, resultPromptOpen]);

  const canShare = useMemo(
    () =>
      Boolean(
        puzzle &&
          mode === "daily" &&
          (solved || (isShowingSolution && shareSnapshot) || (savedRecordExists && !isShowingSolution)),
      ),
    [isShowingSolution, mode, puzzle, savedRecordExists, shareSnapshot, solved],
  );

  const shareUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/waffle-game`
        : "https://wordlessgame.app/waffle-game",
    [],
  );

  const shareInput = useMemo(
    () => ({
      communityStats,
      dailyStats,
      isShowingSolution,
      mode,
      puzzle,
      shareSnapshot,
      solved,
      stars,
      tileStates,
    }),
    [communityStats, dailyStats, isShowingSolution, mode, puzzle, shareSnapshot, solved, stars, tileStates],
  );

  const dailyShareText = useMemo(
    () =>
      buildDailyShareText({
        ...shareInput,
        baseUrl: shareUrl,
      }),
    [shareInput, shareUrl],
  );
  const shareSummary = useMemo(() => buildWaffleShareSummary(shareInput), [shareInput]);
  const sharePreviewCard = useMemo(() => buildWaffleSharePreviewCard(shareInput), [shareInput]);
  const resultStars = shareSnapshot?.stars ?? stars;

  const openShareDialog = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  const closeShareDialog = useCallback(() => {
    setShareDialogOpen(false);
  }, []);

  const closeResultPrompt = useCallback(() => {
    setResultPromptOpen(false);
  }, []);

  const handleOpenShareFromPrompt = useCallback(() => {
    setResultPromptOpen(false);
    setShareDialogOpen(true);
  }, []);

  const handleOpenStatsFromPrompt = useCallback(() => {
    setResultPromptOpen(false);
    onOpenStats();
  }, [onOpenStats]);

  return {
    canShare,
    closeResultPrompt,
    closeShareDialog,
    dailyShareText,
    handleOpenShareFromPrompt,
    handleOpenStatsFromPrompt,
    invalidateShareSnapshot,
    isConfettiActive,
    openShareDialog,
    resetResultState,
    resultPromptOpen,
    resultStars,
    shareDialogOpen,
    sharePreviewCard,
    shareSummary,
    shareUrl,
  };
}
