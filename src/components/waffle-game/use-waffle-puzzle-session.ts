"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

import type {
  WaffleApiResponse,
  WaffleMode,
} from "@/components/waffle-game/waffle-client-types";

type LoadWafflePuzzleOptions = {
  signal?: AbortSignal;
};

type UseWafflePuzzleSessionResult = {
  currentLetters: string[];
  error: string | null;
  isShowingSolution: boolean;
  loadPuzzle: (mode: WaffleMode, options?: LoadWafflePuzzleOptions) => Promise<void>;
  loading: boolean;
  puzzle: WaffleApiResponse | null;
  setCurrentLetters: Dispatch<SetStateAction<string[]>>;
  setIsShowingSolution: Dispatch<SetStateAction<boolean>>;
  setSwapsUsed: Dispatch<SetStateAction<number>>;
  swapsUsed: number;
};

export function useWafflePuzzleSession(): UseWafflePuzzleSessionResult {
  const [puzzle, setPuzzle] = useState<WaffleApiResponse | null>(null);
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [swapsUsed, setSwapsUsed] = useState(0);
  const [isShowingSolution, setIsShowingSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPuzzle = useCallback(
    async (mode: WaffleMode, options?: LoadWafflePuzzleOptions) => {
      setLoading(true);
      setError(null);
      setIsShowingSolution(false);

      try {
        const response = await fetch(`/api/waffle/${mode}`, {
          cache: "no-store",
          signal: options?.signal,
        });
        const payload = (await response.json()) as WaffleApiResponse & { error?: string };

        if (options?.signal?.aborted) {
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error ?? "Waffle puzzle is unavailable.");
        }

        setPuzzle(payload);
        setCurrentLetters(payload.initialLetters);
        setSwapsUsed(0);
      } catch (loadError) {
        if (options?.signal?.aborted) {
          return;
        }

        setPuzzle(null);
        setCurrentLetters([]);
        setError(loadError instanceof Error ? loadError.message : "Failed to load the Waffle puzzle.");
      } finally {
        if (!options?.signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [],
  );

  return {
    currentLetters,
    error,
    isShowingSolution,
    loadPuzzle,
    loading,
    puzzle,
    setCurrentLetters,
    setIsShowingSolution,
    setSwapsUsed,
    swapsUsed,
  };
}
