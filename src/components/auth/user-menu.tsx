'use client';

import Link from "next/link";
import { LoaderCircle, LogIn, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { NavIconButton } from "@/components/nav-icon-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAndRefreshSession, useAuthSession } from "@/hooks/use-auth-session";
import { cn } from "@/lib/utils";

function getAvatarLetter(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

interface UserMenuProps {
  compact?: boolean;
}

export function UserMenu({ compact = false }: UserMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, user, isAuthenticated } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const redirect = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutAndRefreshSession();
      toast.success("You're signed out.");
    } catch (error) {
      console.error("logout error:", error);
      toast.error("Sign-out failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    if (compact) {
      return (
        <NavIconButton
          aria-busy="true"
          disabled
          label="Loading"
          icon={<LoaderCircle className="h-4 w-4 animate-spin" />}
          className="h-9 w-9"
        />
      );
    }

    return (
      <div className="flex h-10 items-center rounded-full border border-violet-100 bg-white px-4 text-sm text-zinc-500">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (compact) {
      return (
        <Button
          asChild
          size="icon"
          className="h-9 w-9 rounded-full bg-violet-600 text-white hover:bg-violet-700"
        >
          <Link
            aria-label="Login"
            href={{
              pathname: "/login",
              query: { redirect },
            }}
          >
            <LogIn className="h-4 w-4" />
          </Link>
        </Button>
      );
    }

    return (
      <Button
        asChild
        className="h-10 rounded-full bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700"
      >
        <Link
          href={{
            pathname: "/login",
            query: { redirect },
          }}
        >
          Login
        </Link>
      </Button>
    );
  }

  const avatarLetter = getAvatarLetter(user.displayName || user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={user.displayName || user.email}
          className={cn(
            "flex items-center justify-center rounded-full border border-violet-100 bg-white text-xs font-semibold text-violet-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2",
            compact ? "h-9 w-9" : "h-10 w-10"
          )}
        >
          {avatarLetter ? avatarLetter : <UserRound className="h-4 w-4" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border-violet-100 p-2 shadow-[0_18px_50px_rgba(139,92,246,0.14)]"
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {avatarLetter ? avatarLetter : <UserRound className="h-4 w-4" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {user.displayName}
              </p>
              <p className="truncate text-xs font-normal text-zinc-500">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-violet-100" />

        <DropdownMenuItem
          disabled={isLoggingOut}
          className="rounded-xl px-3 py-2.5 font-medium text-zinc-700 focus:bg-violet-50 focus:text-violet-700"
          onSelect={() => {
            void handleLogout();
          }}
        >
          {isLoggingOut ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
