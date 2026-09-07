import type { CSSProperties } from "react";

import type { WaffleTileState } from "@/lib/waffle-game";

export type WaffleDisplayTileColor = WaffleTileState | "white";

const WAFFLE_TILE_STYLES: Record<WaffleDisplayTileColor, CSSProperties> = {
  green: {
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    borderColor: "#10B981",
    color: "#ffffff",
  },
  yellow: {
    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    borderColor: "#F59E0B",
    color: "#0f172a",
  },
  gray: {
    background: "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
    borderColor: "#94A3B8",
    color: "#ffffff",
  },
  white: {
    background: "#E2E8F0",
    borderColor: "#94A3B8",
    color: "#334155",
  },
};

export function getWaffleTileStyle(color: WaffleDisplayTileColor): CSSProperties {
  return WAFFLE_TILE_STYLES[color];
}

