"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Archive, BarChart3, CalendarDays, Dices } from "lucide-react";

import { buildShareText } from "@/lib/strands-engine";
import { formatUtcDate } from "@/lib/strands-format";
import { GameModeSwitcher } from "@/components/game-mode-switcher";
import { ShareDialog } from "@/components/share-dialog";
import FoundWordsList from "@/components/strands-game/found-words-list";
import HowToPlaySection from "@/components/strands-game/how-to-play-section";
import StrandsConfetti from "@/components/strands-game/strands-confetti";
import StrandsControls from "@/components/strands-game/strands-controls";
import StrandsGrid from "@/components/strands-game/strands-grid";
import StrandsWinModal from "@/components/strands-game/strands-win-modal";
import { useStrandsGame } from "@/hooks/use-strands-game";
import type { StrandsPuzzleData } from "@/types/strands";

export function StrandsLoadingSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-6 py-8">
      <div className="h-8 w-40 animate-pulse rounded-full bg-stone-200" />
      <div className="h-4 w-56 animate-pulse rounded-full bg-stone-200" />
      <div className="grid aspect-[6/8] w-full max-w-[420px] grid-cols-6 grid-rows-8 gap-2 md:gap-3">
        {Array.from({ length: 48 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-full border border-stone-200 bg-stone-100"
          />
        ))}
      </div>
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
  const [confettiActive, setConfettiActive] = useState(false);
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { theme, words, article } = puzzleData.puzzle;
  const totalWords = words.length + 1;

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
    <div className="flex w-full select-none flex-col items-center gap-6">
      <StrandsToast message={game.message} />
      <StrandsConfetti active={confettiActive} />

      <header className="flex w-full max-w-[420px] flex-col items-center gap-2">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">Strands</h1>
          <div className="flex items-center gap-2">
            {game.isWon ? (
              <button
                type="button"
                onClick={() => setWinModalOpen(true)}
                aria-label="View stats"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition-colors hover:bg-stone-100"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            ) : null}
            <Link
              href="/strands-game/archive"
              aria-label="Puzzle archive"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition-colors hover:bg-stone-100"
            >
              <Archive className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="flex w-full items-center justify-between text-sm text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {game.isPractice ? "Practice" : formatUtcDate(puzzleData.date)}
          </span>
          <span className="font-medium">
            {game.foundWords.length}/{totalWords} found
          </span>
        </div>
      </header>

      <GameModeSwitcher
        activeValue={game.isPractice ? "unlimited" : "daily"}
        className="w-full max-w-[420px]"
        items={[
          {
            icon: <CalendarDays className="h-4 w-4" />,
            label: "Daily",
            value: "daily",
            href: "/strands-game",
          },
          {
            icon: <Dices className="h-4 w-4" />,
            label: "Practice",
            value: "unlimited",
            href: "/strands-game?mode=practice",
          },
        ]}
      />

      <StrandsControls
        theme={theme}
        hintMeter={game.hintMeter}
        articleSlug={article?.slug ?? null}
        onUseHint={game.useHint}
        onShare={openShare}
      />

      <FoundWordsList
        foundWords={game.foundWords}
        isWon={game.isWon}
        onRemoveWord={game.removeFoundWord}
      />

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

      <HowToPlaySection />

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
        isOpen={winModalOpen}
        isPractice={game.isPractice}
        theme={theme}
        totalHintsUsed={game.totalHintsUsed}
        onClose={() => setWinModalOpen(false)}
      />
    </div>
  );
}

type StrandsClientProps = {
  initialDate?: string;
};

export default function StrandsClient({ initialDate }: StrandsClientProps) {
  const searchParams = useSearchParams();
  const isPractice = searchParams.get("mode") === "practice";
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
