"use client";

import type { WafflePuzzlePayload, WaffleTileState } from "@/lib/waffle-game";

export type WaffleMode = "daily" | "unlimited";

export type WaffleApiResponse = WafflePuzzlePayload & {
  boardSize: number;
  date: string | null;
  mode: WaffleMode;
  sequence: number | null;
  status: string | null;
  timezone: string;
  version: string | null;
};

export type WafflePlayableCellView = {
  index: number;
  letter: string;
  state: WaffleTileState;
};

export type WaffleMoveSnapshot = {
  letters: string[];
  swapsUsed: number;
};

export type SwapAnimation = {
  active: boolean;
  fromIndex: number;
  fromLetter: string;
  fromState: WaffleTileState;
  fromX: number;
  fromY: number;
  toIndex: number;
  toLetter: string;
  toState: WaffleTileState;
  toX: number;
  toY: number;
};

export type WaffleShareSnapshot = {
  solved: boolean;
  stars: number;
  tileStates: WaffleTileState[];
};
