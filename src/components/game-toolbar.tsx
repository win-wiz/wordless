import { CalendarDays, Minus, Plus, RefreshCw } from "lucide-react";

import UseTimes from "@/components/use-times";
import type { DailyWordResponse } from "@/lib/api";
import type { GameMode } from "@/hooks/use-wordless-game";

function formatLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

interface GameToolbarProps {
  canDecreaseLength: boolean;
  canIncreaseLength: boolean;
  columns: number;
  dailyChallenge: DailyWordResponse | null;
  gameMode: GameMode;
  hasFirstInput: boolean;
  isGameOver: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onStartGame: () => void;
  onTimeChange: (time: number) => void;
  showKeyboard: boolean;
  totalTime: number;
}

export function GameToolbar({
  canDecreaseLength,
  canIncreaseLength,
  columns,
  dailyChallenge,
  gameMode,
  hasFirstInput,
  isGameOver,
  onDecrease,
  onIncrease,
  onStartGame,
  onTimeChange,
  showKeyboard,
  totalTime,
}: GameToolbarProps) {
  const fallbackDate = formatLocalDate();
  const challengeDate = dailyChallenge?.date ?? fallbackDate;

  return (
    <div className="mb-7 flex w-full justify-center">
      <div className="flex w-full max-w-[640px] flex-wrap items-center justify-center gap-2">
        {gameMode === 'unlimited' && (
          <div className="flex h-12 items-center rounded-full border border-violet-100/80 bg-white/90 px-3 shadow-[0_10px_30px_rgba(139,92,246,0.08)] backdrop-blur">
            <div className="flex h-9 items-center">
              <button
                onClick={onDecrease}
                aria-label="Decrease word length"
                className="flex h-9 w-9 items-center justify-center rounded-full text-violet-600 transition-colors hover:bg-violet-50 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={!canDecreaseLength}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="min-w-[40px] text-center text-sm font-semibold text-violet-700">
                {columns}
              </div>
              <button
                onClick={onIncrease}
                aria-label="Increase word length"
                className="flex h-9 w-9 items-center justify-center rounded-full text-violet-600 transition-colors hover:bg-violet-50 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={!canIncreaseLength}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {gameMode === 'daily' && (
          <div className="flex h-12 items-center gap-2 rounded-full border border-violet-100/80 bg-white/90 px-4 shadow-[0_10px_30px_rgba(139,92,246,0.08)] backdrop-blur">
            <div className="flex items-center gap-2 text-zinc-500">
              <CalendarDays className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-semibold text-zinc-700">
                {challengeDate}
              </span>
            </div>
          </div>
        )}

        <div className="flex h-12 items-center gap-2 rounded-full border border-violet-100/80 bg-white/90 px-3 shadow-[0_10px_30px_rgba(139,92,246,0.08)] backdrop-blur">
            <div className="flex min-w-[96px] items-center justify-center px-1 text-sm font-semibold text-violet-700">
            <UseTimes
                currentTime={totalTime}
              showKeyboard={showKeyboard}
              hasFirstInput={hasFirstInput}
              isGameOver={isGameOver}
              onTimeChange={onTimeChange}
            />
            </div>

          {gameMode === 'unlimited' && (
            <button
              onClick={onStartGame}
              aria-label="Start new game"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-violet-600 transition-all hover:bg-violet-50"
            >
              <RefreshCw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            </button>
          )}
          </div>
      </div>
    </div>
  );
}
