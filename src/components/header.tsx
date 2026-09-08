'use client';

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import logo from "@/../public/wordless.png";
import {
  ArrowUpRight,
  BarChart3,
  Brain,
  ChefHat,
  CircleHelp,
  Gamepad2,
  Infinity,
  Layers3,
  Menu,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShareDialog } from "./share-dialog";
import { useEffect, useState } from "react";
import { DailyStatsPanel } from "@/components/daily-stats-panel";
import { GameModeSwitcher } from "@/components/game-mode-switcher";
import { NavIconButton } from "@/components/nav-icon-button";
import { UserMenu } from "@/components/auth/user-menu";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { GAME_NAVIGATION_ITEMS, getGameHref, isGameActive } from "@/lib/game-navigation";
import type { GameNavigationItem, HeaderGameMode } from "@/lib/game-navigation";
import { cn } from "@/lib/utils";

const MODE_PARAM_VALUES = new Set(["classic", "unlimited"]);

const MOBILE_SIDEBAR_SECTIONS = [
  {
    description: "Runs directly inside Wordless.",
    key: "local",
    title: "Local Games",
  },
  {
    description: "Loads an external experience inside the game page.",
    key: "embedded",
    title: "Embedded Games",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  key: GameNavigationItem["source"];
  title: string;
}>;

function renderGameIcon(icon: GameNavigationItem["icon"]) {
  switch (icon) {
    case "sparkles":
      return <Sparkles className="h-4 w-4" />;
    case "waffle":
      return <Gamepad2 className="h-4 w-4" />;
    case "memory":
      return <Brain className="h-4 w-4" />;
    case "kitchen":
      return <ChefHat className="h-4 w-4" />;
    case "stack":
      return <Layers3 className="h-4 w-4" />;
    default:
      return <Gamepad2 className="h-4 w-4" />;
  }
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navPanelLeft, setNavPanelLeft] = useState(16);
  const [sidebarMode, setSidebarMode] = useState<HeaderGameMode>('daily');
  const isHomePage = pathname === '/';
  const isWafflePage = pathname === '/waffle-game';
  const showsStatsEntry = isHomePage || pathname === "/stats";
  const activeMode: HeaderGameMode =
    MODE_PARAM_VALUES.has(searchParams.get('mode') ?? "") ? 'unlimited' : 'daily';
  const showsWaffleStatsEntry = isWafflePage && activeMode === "daily";
  const isWaffleStatsPanelOpen = searchParams.get("panel") === "stats";
  const shouldShowModeSwitch = isHomePage || isWafflePage;
  const modeSwitcherItems = [
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: isWafflePage ? "Daily" : "Daily challenge",
      value: "daily" as const,
    },
    {
      icon: <Infinity className="h-4 w-4" />,
      label: "Unlimited",
      value: "unlimited" as const,
    },
  ] as const;

  const updateCurrentRouteParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const scrollToHelp = () => {
    const targetId = isWafflePage ? 'help-center' : 'how-to-play';
    const helpSection = document.getElementById(targetId);
    if (helpSection) {
      helpSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }

    if (isWafflePage) {
      router.push('/waffle-game#help-center');
      return;
    }

    router.push('/#how-to-play');
  };

  const handleShareClick = async () => {
    if (
      typeof window !== 'undefined' &&
      window.innerWidth < 768 &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: 'Wordless Game',
          text: 'Challenge your friends with Wordless Game.',
          url: window.location.origin,
        });
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
      }
    }

    setShareDialogOpen(true);
  };

  const handleOpenWaffleStats = () => {
    updateCurrentRouteParams((params) => {
      params.set("panel", "stats");
    });
  };

  const handleModeChange = (nextMode: HeaderGameMode) => {
    updateCurrentRouteParams((params) => {
      if (nextMode === "daily") {
        params.delete("mode");
      } else {
        params.set("mode", "unlimited");
      }

      params.delete("panel");
    });
  };

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    setSidebarMode(activeMode);
  }, [activeMode]);

  useEffect(() => {
    const updateNavPanelPosition = () => {
      if (typeof window === "undefined") {
        return;
      }

      const contentMaxWidth = 1024;
      const contentInset = 16;
      const containerLeft = Math.max(contentInset, (window.innerWidth - contentMaxWidth) / 2 + contentInset);
      setNavPanelLeft(containerLeft);
    };

    updateNavPanelPosition();

    if (!mobileNavOpen) {
      return;
    }

    window.addEventListener("resize", updateNavPanelPosition);
    window.addEventListener("scroll", updateNavPanelPosition, { passive: true });

    return () => {
      window.removeEventListener("resize", updateNavPanelPosition);
      window.removeEventListener("scroll", updateNavPanelPosition);
    };
  }, [mobileNavOpen]);

  const helpVisible = true;
  const mobileSidebarGames = GAME_NAVIGATION_ITEMS.filter((item) => item.includeInMobileSidebar);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-violet-100/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 md:gap-3">
            <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <DialogPrimitive.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-zinc-500 transition-colors duration-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </DialogPrimitive.Trigger>

              <DialogPortal>
                <DialogOverlay
                  className={cn(
                    "bg-zinc-950/50 backdrop-blur-[3px] transition-opacity duration-300 ease-out",
                    "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
                  )}
                />
                <DialogPrimitive.Content
                  className={cn(
                    "fixed inset-y-0 z-50 flex h-[100dvh] w-[min(92vw,26rem)] flex-col overflow-hidden border-r border-violet-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,245,255,0.96))] shadow-[28px_0_90px_rgba(24,24,27,0.22)] outline-none will-change-transform",
                    "transition-[transform,opacity] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "data-[state=open]:translate-x-0 data-[state=open]:opacity-100 data-[state=open]:scale-100",
                    "data-[state=closed]:-translate-x-[calc(100%+3rem)] data-[state=closed]:opacity-0 data-[state=closed]:scale-[0.985]",
                  )}
                  style={{ left: `${navPanelLeft}px` }}
                >
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-violet-200/20" />
                  <div className="flex items-center justify-between border-b border-violet-100 px-5 py-4">
                    <div>
                      <DialogTitle className="text-base font-semibold text-zinc-900">
                        Explore Wordless
                      </DialogTitle>
                      <DialogDescription className="mt-1 text-sm text-zinc-500">
                        Quick game shortcuts, just like a mobile side menu.
                      </DialogDescription>
                    </div>
                    <DialogPrimitive.Close asChild>
                      <button
                        type="button"
                        aria-label="Close navigation menu"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-100 bg-white text-zinc-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </DialogPrimitive.Close>
                  </div>

                  <div className="flex-1 px-4 py-4">
                    <div className="space-y-5">
                      {MOBILE_SIDEBAR_SECTIONS.map((section) => {
                        const items = mobileSidebarGames.filter((item) => item.source === section.key);

                        if (items.length === 0) {
                          return null;
                        }

                        return (
                          <section key={section.key} className="space-y-3">
                            <div className="flex items-start justify-between gap-3 px-1">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                  {section.title}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                  {section.description}
                                </p>
                              </div>
                              {section.key === "local" ? (
                                <GameModeSwitcher
                                  size="compact"
                                  surface="subtle"
                                  className="w-[11.5rem] shrink-0"
                                  activeValue={sidebarMode}
                                  onValueChange={setSidebarMode}
                                  items={[
                                    {
                                      icon: <Sparkles className="h-3.5 w-3.5" />,
                                      label: "Daily",
                                      value: "daily",
                                    },
                                    {
                                      icon: <Infinity className="h-3.5 w-3.5" />,
                                      label: "Unlimited",
                                      value: "unlimited",
                                    },
                                  ]}
                                />
                              ) : null}
                            </div>

                            <div className="space-y-3">
                              {items.map((item) => {
                                const isSameGame = isGameActive(item, pathname);
                                const isCurrent =
                                  isSameGame &&
                                  (item.modeSupport !== "toggle" || sidebarMode === activeMode);

                                return (
                                  <Link
                                    key={item.id}
                                    href={getGameHref(item, sidebarMode)}
                                    onClick={() => setMobileNavOpen(false)}
                                    className={cn(
                                      "group flex items-center justify-between rounded-[26px] border px-4 py-4 shadow-[0_14px_40px_rgba(24,24,27,0.08)] transition-all duration-200",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2",
                                      isCurrent
                                        ? "border-violet-200 bg-[linear-gradient(135deg,rgba(245,243,255,0.98),rgba(255,255,255,0.98))]"
                                        : isSameGame
                                          ? "border-violet-200/80 bg-violet-50/70 hover:bg-violet-50"
                                          : "border-violet-100 bg-white/95 hover:border-violet-200 hover:bg-violet-50/70",
                                    )}
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      <span
                                        className={cn(
                                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
                                          isCurrent
                                            ? "bg-violet-600 text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)]"
                                            : isSameGame
                                              ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                                              : "bg-violet-50 text-violet-600 ring-1 ring-violet-100 group-hover:bg-violet-100",
                                        )}
                                      >
                                        {renderGameIcon(item.icon)}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="truncate text-base font-semibold text-zinc-900">
                                          {item.shortTitle}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                          {item.source === "local" ? "Built into Wordless" : "Embedded from partner page"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="ml-4 flex shrink-0 items-center gap-2">
                                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200">
                                        {item.source === "local" ? "Local" : "Embedded"}
                                      </span>
                                      {isCurrent ? (
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-600 ring-1 ring-violet-100">
                                          Current
                                        </span>
                                      ) : null}
                                      <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-colors duration-200 group-hover:text-violet-600" />
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                </DialogPrimitive.Content>
              </DialogPortal>
            </Dialog>

            <Link href="/" className="flex items-center gap-2.5 md:gap-3">
              <Image
                src={logo}
                alt="Wordless logo"
                width={32}
                height={32}
                className="rounded-lg shadow-sm ring-1 ring-violet-200/60"
              />
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-zinc-900 to-violet-600 bg-clip-text text-xl font-bold tracking-[-0.03em] text-transparent md:text-2xl">
                  Wordless
                </span>
                <span className="hidden text-xs font-medium text-zinc-500 md:block">
                  Daily word challenge, every day
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center justify-end gap-2 md:hidden">
            {showsStatsEntry && (
              <DailyStatsPanel triggerClassName="h-8 w-8" />
            )}

            {showsWaffleStatsEntry ? (
              <NavIconButton
                active={isWaffleStatsPanelOpen}
                onClick={handleOpenWaffleStats}
                label="Stats"
                icon={<BarChart3 className="h-[18px] w-[18px]" />}
                className="h-8 w-8"
              />
            ) : null}

            <NavIconButton
              onClick={() => {
                void handleShareClick();
              }}
              label="Share"
              icon={<Share2 className="h-[18px] w-[18px]" />}
              className="h-8 w-8"
            />

            {helpVisible ? (
              <NavIconButton
                onClick={scrollToHelp}
                label="Help"
                icon={<CircleHelp className="h-[18px] w-[18px]" />}
                className="h-8 w-8"
              />
            ) : null}

            <UserMenu compact />
          </div>
            {shouldShowModeSwitch ? (
              <div className="hidden flex-1 justify-center md:flex">
                <GameModeSwitcher
                  activeValue={activeMode}
                  onValueChange={handleModeChange}
                  items={modeSwitcherItems}
                  className="w-full max-w-[320px]"
                />
              </div>
            ) : null}
          <div className="hidden items-center justify-end gap-2 md:flex">
            {showsStatsEntry && (
              <DailyStatsPanel />
            )}

            {showsWaffleStatsEntry ? (
              <NavIconButton
                active={isWaffleStatsPanelOpen}
                onClick={handleOpenWaffleStats}
                label="Stats"
                icon={<BarChart3 className="h-[18px] w-[18px]" />}
              />
            ) : null}

            <NavIconButton
              onClick={() => {
                void handleShareClick();
              }}
              label="Share"
              icon={<Share2 className="h-[18px] w-[18px]" />}
            />

            {helpVisible ? (
              <NavIconButton
                onClick={scrollToHelp}
                label="Help"
                icon={<CircleHelp className="h-[18px] w-[18px]" />}
              />
            ) : null}

            <UserMenu />
          </div>
        </div>

        {shouldShowModeSwitch ? (
          <div className="md:hidden">
            <GameModeSwitcher
              activeValue={activeMode}
              onValueChange={handleModeChange}
              items={[
                {
                  icon: <Sparkles className="h-4 w-4" />,
                  label: "Daily",
                  value: "daily",
                },
                {
                  icon: <Infinity className="h-4 w-4" />,
                  label: "Unlimited",
                  value: "unlimited",
                },
              ]}
            />
          </div>
        ) : null}
      </div>
      
      <ShareDialog 
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title="Share Wordless Game"
        description="Challenge your friends with the ultimate Wordless Game experience! Master word puzzles, train your brain, and enjoy unlimited Wordless Game challenges together."
      />
    </header>
  );
}
