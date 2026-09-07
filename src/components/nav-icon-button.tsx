'use client';

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface NavIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  active?: boolean;
}

export const NavIconButton = forwardRef<HTMLButtonElement, NavIconButtonProps>(
  ({ className, icon, label, active = false, disabled, ...props }, ref) => {
    return (
      <div className="group relative inline-flex">
        <button
          ref={ref}
          type="button"
          aria-label={label}
          data-active={active}
          disabled={disabled}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-violet-100 bg-white text-zinc-600 shadow-sm transition-all duration-200",
            "hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2",
            "data-[active=true]:border-violet-200 data-[active=true]:bg-violet-50 data-[active=true]:text-violet-600",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-violet-100 disabled:hover:bg-white disabled:hover:text-zinc-600",
            className,
          )}
          {...props}
        >
          {icon}
        </button>
        <div className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 md:block">
          {label}
        </div>
      </div>
    );
  },
);

NavIconButton.displayName = "NavIconButton";
