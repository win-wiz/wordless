"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChefHat, ChevronDown, Gamepad2, Grid3x3, Layers3, Sparkles } from "lucide-react";

import { GAME_NAVIGATION_ITEMS, getGameHref } from "@/lib/game-navigation";
import type { GameNavigationItem, HeaderGameMode } from "@/lib/game-navigation";

function renderGameIcon(icon: GameNavigationItem["icon"]) {
  switch (icon) {
    case "sparkles":
      return <Sparkles className="h-4 w-4" />;
    case "waffle":
      return <Gamepad2 className="h-4 w-4" />;
    case "kitchen":
      return <ChefHat className="h-4 w-4" />;
    case "stack":
      return <Layers3 className="h-4 w-4" />;
    case "strands":
      return <Grid3x3 className="h-4 w-4" />;
    default:
      return <Gamepad2 className="h-4 w-4" />;
  }
}

const DROPDOWN_SECTIONS = [
  { key: "local", title: "Local Games" },
  { key: "embedded", title: "Embedded Games" },
] as const;

const GamesDropdownComponent = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const defaultMode: HeaderGameMode = "daily";
  const items = useMemo(
    () => GAME_NAVIGATION_ITEMS.filter((item) => item.includeInMoreGames),
    [],
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside, open]);

  const handleToggle = useCallback(() => {
    setOpen((value) => !value);
  }, []);

  const menu = useMemo(
    () => (
      <div className="absolute left-0 z-20 mt-2 w-[280px] rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
        <div className="space-y-2">
          {DROPDOWN_SECTIONS.map((section) => {
            const sectionItems = items.filter((item) => item.source === section.key);

            if (sectionItems.length === 0) {
              return null;
            }

            return (
              <div key={section.key} className="rounded-xl bg-zinc-50/70 p-2">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {sectionItems.map((item) => (
                    <Link
                      key={item.id}
                      href={getGameHref(item, defaultMode)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-zinc-700 transition hover:bg-white hover:text-zinc-900"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-violet-500">{renderGameIcon(item.icon)}</span>
                        <span className="text-sm font-medium">{item.shortTitle}</span>
                      </span>
                      <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-500">
                        {item.source === "local" ? "Local" : "Embedded"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    [items],
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-zinc-100 focus:outline-none"
        onClick={handleToggle}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Gamepad2 className="h-5 w-5 text-violet-500" />
        <span className="ml-1 select-none text-lg font-medium text-violet-500">More Games</span>
        <ChevronDown className="ml-1 h-4 w-4 text-violet-400" />
      </button>
      {open ? menu : null}
    </div>
  );
};

export const GamesDropdown = React.memo(GamesDropdownComponent);
