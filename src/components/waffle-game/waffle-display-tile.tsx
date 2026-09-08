import React from "react";

import { getWaffleTileStyle, type WaffleDisplayTileColor } from "@/components/waffle-game/waffle-tile-theme";
import { cn } from "@/lib/utils";

type WaffleDisplayTileProps = {
  letter?: string;
  color?: WaffleDisplayTileColor;
  isEmpty?: boolean;
  className?: string;
  isIntersection?: boolean;
};

const COLOR_CLASSES: Record<WaffleDisplayTileColor, string> = {
  green: "text-white border-none shadow-md",
  yellow: "border-none shadow-md",
  gray: "text-white border-none shadow-md",
  white: "bg-slate-200 text-slate-700 border-2 border-slate-400",
};

const WaffleDisplayTile: React.FC<WaffleDisplayTileProps> = React.memo(
  ({
    letter,
    color = "white",
    isEmpty = false,
    className = "",
    isIntersection = false,
  }) => {
    if (isEmpty) {
      return <div className={cn("h-12 w-12", className)} />;
    }

    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border font-bold",
          "h-12 w-12 text-lg",
          COLOR_CLASSES[color],
          isIntersection ? "ring-4 ring-blue-500 ring-offset-2 shadow-lg" : "shadow-md",
          className,
        )}
        style={getWaffleTileStyle(color)}
      >
        {letter}
      </div>
    );
  },
);

WaffleDisplayTile.displayName = "WaffleDisplayTile";

export default WaffleDisplayTile;

