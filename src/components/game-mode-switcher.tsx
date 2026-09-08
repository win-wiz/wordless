'use client';

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type GameModeSwitcherValue = "daily" | "unlimited";

export type GameModeSwitcherItem = {
  icon: ReactNode;
  label: string;
  value: GameModeSwitcherValue;
  href?: string;
};

interface GameModeSwitcherProps {
  activeValue: GameModeSwitcherValue;
  items: readonly [GameModeSwitcherItem, GameModeSwitcherItem];
  className?: string;
  onValueChange?: (value: GameModeSwitcherValue) => void;
  onNavigate?: () => void;
  size?: "default" | "compact";
  surface?: "default" | "subtle";
}

export function GameModeSwitcher({
  activeValue,
  items,
  className,
  onValueChange,
  onNavigate,
  size = "default",
  surface = "default",
}: GameModeSwitcherProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2",
        size === "compact" ? "rounded-xl p-0.5" : "rounded-2xl p-1",
        surface === "subtle"
          ? "border border-violet-100/80 bg-violet-50/70 shadow-none"
          : "border border-violet-100/90 bg-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.08)]",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = activeValue === item.value;
        const className = cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200",
          size === "compact"
            ? "h-8 gap-1.5 rounded-lg px-2.5 text-[13px]"
            : "h-10 gap-2 rounded-xl px-3 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2",
          surface === "subtle"
            ? isActive
              ? "bg-white text-violet-700 shadow-[0_4px_14px_rgba(139,92,246,0.10)]"
              : "text-zinc-500 hover:bg-white/80 hover:text-violet-700"
            : isActive
              ? "bg-violet-600 text-white shadow-sm"
              : "text-violet-700 hover:bg-violet-50",
        );

        if (item.href) {
          return (
            <Link
              key={item.value}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onValueChange?.(item.value)}
            className={className}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
