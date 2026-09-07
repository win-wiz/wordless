'use client';

import { LoaderCircle, LogIn, LogOut, UserRound } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthDialog } from "@/components/auth/auth-dialog-provider";
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
  const { openLoginDialog } = useAuthDialog();
  const { isLoading, user, isAuthenticated } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const redirect = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openHoverMenu = () => {
    clearCloseTimer();
    setIsMenuOpen(true);
  };

  const scheduleCloseMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsMenuOpen(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutAndRefreshSession();
      setIsMenuOpen(false);
      toast.success("You're signed out.");
    } catch (error) {
      console.error("logout error:", error);
      toast.error("Sign-out failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const triggerSizeClassName = compact ? "h-9 w-9" : "h-10 w-10";

  if (isLoading) {
    return (
      <NavIconButton
        aria-busy="true"
        disabled
        label="Loading"
        icon={<LoaderCircle className="h-4 w-4 animate-spin" />}
        className={triggerSizeClassName}
      />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        type="button"
        size="icon"
        aria-label="Login"
        onClick={() => openLoginDialog({ redirect })}
        className={cn(
          "rounded-full bg-violet-600 text-white hover:bg-violet-700",
          triggerSizeClassName,
        )}
      >
        <LogIn className="h-4 w-4" />
      </Button>
    );
  }

  const avatarLetter = getAvatarLetter(user.displayName || user.email);
  const avatarLabel = user.displayName || user.email;
  const renderAvatar = (sizeClassName: string) => {
    if (user.image) {
      return (
        <span
          aria-hidden="true"
          className={`block ${sizeClassName} rounded-full bg-cover bg-center bg-no-repeat`}
          style={{ backgroundImage: `url("${user.image}")` }}
        />
      );
    }

    if (avatarLetter) {
      return avatarLetter;
    }

    return <UserRound className="h-4 w-4" />;
  };

  return (
    <DropdownMenu modal={false} open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={avatarLabel}
          onMouseEnter={openHoverMenu}
          onMouseLeave={scheduleCloseMenu}
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-white text-xs font-semibold text-violet-700 shadow-sm transition-colors duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2",
            triggerSizeClassName
          )}
        >
          {renderAvatar("h-full w-full")}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={0}
        onMouseEnter={openHoverMenu}
        onMouseLeave={scheduleCloseMenu}
        className="w-64 rounded-2xl border-violet-100 p-2 shadow-[0_18px_50px_rgba(139,92,246,0.14)]"
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {renderAvatar("h-10 w-10")}
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
