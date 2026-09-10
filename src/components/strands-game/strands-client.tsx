"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buildShareText } from "@/lib/strands-engine";
import { ShareDialog } from "@/components/share-dialog";
import StrandsConfetti from "@/components/strands-game/strands-confetti";
import StrandsBoardLayout from "@/components/strands-game/strands-game-layout";
import StrandsGrid from "@/components/strands-game/strands-grid";
import StrandsSidePanel, {
  StrandsSidePanelSkeleton,
} from "@/components/strands-game/strands-side-panel";
import StrandsWinModal from "@/components/strands-game/strands-win-modal";
import { useStrandsGame } from "@/hooks/use-strands-game";
import type { StrandsPuzzleData } from "@/types/strands";

export function StrandsLoadingSkeleton() {
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-5">
      <StrandsBoardLayout
        sidePanel={<StrandsSidePanelSkeleton />}
        grid={
          <div className="mx-auto grid aspect-[6/8] w-full max-w-[420px] grid-cols-6 grid-rows-8 gap-2 md:gap-3 lg:gap-3.5">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-full border border-stone-200 bg-stone-100"
              />
            ))}
          </div>
        }
      />
    </div>
  );
}

function StrandsToast({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      className="strands-toast fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full border border-stone-200 bg-stone-900/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
    >
      {message}
    </div>
  );
}

function StrandsGameInner({ puzzleData }: { puzzleData: StrandsPuzzleData }) {
  const game = useStrandsGame(puzzleData);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [confettiActive, setConfettiActive] = useState(false);
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { theme, words, article } = puzzleData.puzzle;
  const totalWords = words.length + 1;
  const isStatsPanelOpen = searchParams.get("panel") === "stats" && !game.isPractice;

  const closeWinModal = useCallback(() => {
    setWinModalOpen(false);
    if (searchParams.get("panel") === "stats") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("panel");
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  // §3.7 胜利序列：仅"刚赢"（justWon）才自动播放；恢复的胜利保持静默
  useEffect(() => {
    if (!(game.isWon && game.isLoaded && game.justWon)) {
      return;
    }
    const confettiTimer = window.setTimeout(() => setConfettiActive(true), 50);
    const modalTimer = window.setTimeout(() => setWinModalOpen(true), 1500);
    return () => {
      window.clearTimeout(confettiTimer);
      window.clearTimeout(modalTimer);
    };
  }, [game.isWon, game.isLoaded, game.justWon]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/strands-game`
      : "https://wordlessgame.app/strands-game";

  const shareText = buildShareText({
    theme,
    hintsUsed: game.totalHintsUsed,
    isPractice: game.isPractice,
    url: shareUrl,
  });

  const openShare = useCallback(() => setShareDialogOpen(true), []);

  return (
    <div className="flex w-full flex-1 select-none flex-col items-center gap-5">
      <StrandsToast message={game.message} />
      <StrandsConfetti active={confettiActive} />

      <StrandsBoardLayout
        sidePanel={
          <StrandsSidePanel
            articleSlug={article?.slug ?? null}
            dateLabel={puzzleData.date}
            foundWords={game.foundWords}
            hintMeter={game.hintMeter}
            isPractice={game.isPractice}
            isWon={game.isWon}
            theme={theme}
            totalWords={totalWords}
            onRemoveWord={game.removeFoundWord}
            onShare={openShare}
            onUseHint={game.useHint}
          />
        }
        grid={
          <StrandsGrid
            grid={game.grid}
            foundWords={game.foundWords}
            currentPath={game.currentPath}
            errorPath={game.errorPath}
            hintCells={game.hintCells}
            occupiedCells={game.occupiedCells}
            onCellPointerDown={game.handleCellPointerDown}
            onPointerMove={game.handlePointerMove}
          />
        }
      />

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title="Share Strands"
        description="Copy your Strands result and challenge your friends."
        customShareText={shareText}
        url={shareUrl}
        theme="waffle"
      />

      <StrandsWinModal
        isOpen={winModalOpen || isStatsPanelOpen}
        isPractice={game.isPractice}
        isWon={game.isWon}
        theme={theme}
        totalHintsUsed={game.totalHintsUsed}
        onClose={closeWinModal}
      />
    </div>
  );
}

type StrandsClientProps = {
  initialDate?: string;
};

export default function StrandsClient({ initialDate }: StrandsClientProps) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const isPractice = modeParam === "practice" || modeParam === "unlimited";
  const dateParam = searchParams.get("date") ?? initialDate ?? null;

  const [puzzleData, setPuzzleData] = useState<StrandsPuzzleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPuzzle() {
      setLoading(true);
      try {
        const url = isPractice
          ? "/api/strands/practice"
          : `/api/strands/daily${dateParam ? `?date=${encodeURIComponent(dateParam)}` : ""}`;
        const response = await fetch(url, { cache: "no-store" });
        const payload = (await response.json()) as {
          data: StrandsPuzzleData | null;
        };
        if (!cancelled) {
          setPuzzleData(payload.data ?? null);
        }
      } catch {
        if (!cancelled) {
          setPuzzleData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPuzzle();
    return () => {
      cancelled = true;
    };
  }, [isPractice, dateParam]);

  if (loading) {
    return <StrandsLoadingSkeleton />;
  }

  if (!puzzleData) {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center">
        <p className="rounded-3xl border border-stone-200 bg-white/80 px-8 py-6 text-center text-sm font-medium text-stone-600 shadow-sm">
          No puzzle available today.
        </p>
      </div>
    );
  }

  // §3.1：换题必须整体重挂载
  return <StrandsGameInner key={puzzleData.puzzle.id} puzzleData={puzzleData} />;
}
