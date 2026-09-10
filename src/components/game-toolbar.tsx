import { CalendarDays, Clock3, Minus, Plus, RefreshCw } from "lucide-react";

import { GameInfoPill, GameInfoPillSkeleton } from "@/components/game-info-pill";
import UseTimes from "@/components/use-times";
import type { DailyWordResponse } from "@/lib/api";
import type { GameMode } from "@/hooks/use-wordless-game";

interface GameToolbarProps {
  canDecreaseLength: boolean;
  canIncreaseLength: boolean;
  columns: number;
  dailyChallenge: DailyWordResponse | null;
  gameMode: GameMode;
  hasFirstInput: boolean;
  isGameOver: boolean;
  isLoadingWord: boolean;
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
  isLoadingWord,
  onDecrease,
  onIncrease,
  onStartGame,
  onTimeChange,
  showKeyboard,
  totalTime,
}: GameToolbarProps) {
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

        {gameMode === 'daily' &&
          (dailyChallenge ? (
            <GameInfoPill
              icon={<CalendarDays className="h-4 w-4" />}
              label="Challenge date"
              value={dailyChallenge.date}
              valueClassName="text-sm text-zinc-700"
              className="h-12 border-violet-100/80 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]"
            />
          ) : isLoadingWord ? (
            <GameInfoPillSkeleton
              className="h-12 border-violet-100/80 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]"
              valueWidthClassName="w-[132px]"
            />
          ) : (
            <GameInfoPill
              icon={<CalendarDays className="h-4 w-4" />}
              label="Challenge date unavailable"
              value="--"
              valueClassName="text-sm text-zinc-400"
              className="h-12 border-violet-100/80 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]"
            />
          ))}

        <div className="flex items-center gap-2">
          <GameInfoPill
            icon={<Clock3 className="h-4 w-4" />}
            label="Elapsed time"
            value={
              <UseTimes
                currentTime={totalTime}
                showKeyboard={showKeyboard}
                hasFirstInput={hasFirstInput}
                isGameOver={isGameOver}
                onTimeChange={onTimeChange}
                showIcon={false}
              />
            }
            valueClassName="min-w-[96px] justify-center px-1 text-sm text-violet-700"
            className="h-12 border-violet-100/80 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]"
          />

          {gameMode === 'unlimited' && (
            <button
              onClick={onStartGame}
              aria-label="Start new game"
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-violet-100/80 bg-white/90 text-violet-600 shadow-[0_10px_30px_rgba(139,92,246,0.08)] transition-all hover:bg-violet-50"
            >
              <RefreshCw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
