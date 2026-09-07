'use client';

import Image from "next/image";
import logo from "@/../public/wordless.png";
import { BarChart3, CircleHelp, Infinity, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShareDialog } from "./share-dialog";
import { useState, type ReactNode } from "react";
import { DailyStatsPanel } from "@/components/daily-stats-panel";
import { NavIconButton } from "@/components/nav-icon-button";
import { UserMenu } from "@/components/auth/user-menu";

type HeaderGameMode = 'daily' | 'unlimited';

const MODE_PARAM_VALUES = new Set(["classic", "unlimited"]);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const isHomePage = pathname === '/';
  const isWafflePage = pathname === '/waffle-game';
  const showsStatsEntry = isHomePage || pathname === "/stats";
  const activeMode: HeaderGameMode =
    MODE_PARAM_VALUES.has(searchParams.get('mode') ?? "") ? 'unlimited' : 'daily';
  const showsWaffleStatsEntry = isWafflePage && activeMode === "daily";
  const isWaffleStatsPanelOpen = searchParams.get("panel") === "stats";

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

  const handleModeChange = (nextMode: HeaderGameMode) => {
    updateCurrentRouteParams((params) => {
      if (nextMode === 'daily') {
        params.delete('mode');
      } else {
        params.set('mode', 'unlimited');
      }

      params.delete("panel");
    });
  };

  const handleOpenWaffleStats = () => {
    updateCurrentRouteParams((params) => {
      params.set("panel", "stats");
    });
  };

  const renderModeButton = ({
    nextMode,
    label,
    icon,
    className,
  }: {
    nextMode: HeaderGameMode;
    label: string;
    icon: ReactNode;
    className: string;
  }) => (
    <button
      type="button"
      onClick={() => handleModeChange(nextMode)}
      aria-pressed={activeMode === nextMode}
      className={className}
    >
      {icon}
      {label}
    </button>
  );

  const shouldShowModeSwitch = isHomePage || isWafflePage;
  const helpVisible = true;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-violet-100/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
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
          <div className="flex items-center justify-end gap-2 md:hidden">
            {showsStatsEntry && (
              <DailyStatsPanel triggerClassName="h-8 w-8" />
            )}

            {showsWaffleStatsEntry ? (
              <NavIconButton
                active={isWaffleStatsPanelOpen}
                onClick={handleOpenWaffleStats}
                label="Stats"
                icon={<BarChart3 className="h-4 w-4" />}
                className="h-8 w-8"
              />
            ) : null}

            <NavIconButton
              onClick={() => {
                void handleShareClick();
              }}
              label="Share"
              icon={<Share2 className="h-4 w-4" />}
              className="h-8 w-8"
            />

            {helpVisible ? (
              <NavIconButton
                onClick={scrollToHelp}
                label="Help"
                icon={<CircleHelp className="h-4 w-4" />}
                className="h-8 w-8"
              />
            ) : null}

            <UserMenu compact />
          </div>
          {shouldShowModeSwitch ? (
            <div className="hidden w-full items-center justify-center md:flex md:w-auto">
              <div className="inline-flex rounded-full border border-violet-100 bg-white/90 p-1 shadow-[0_10px_30px_rgba(139,92,246,0.08)]">
                {renderModeButton({
                  nextMode: 'daily',
                  label: isWafflePage ? 'Daily' : 'Daily challenge',
                  icon: <Sparkles className="h-4 w-4" />,
                  className: `inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
                    activeMode === 'daily'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-violet-700 hover:bg-violet-50'
                  }`,
                })}
                {renderModeButton({
                  nextMode: 'unlimited',
                  label: 'Unlimited',
                  icon: <Infinity className="h-4 w-4" />,
                  className: `inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
                    activeMode === 'unlimited'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-violet-700 hover:bg-violet-50'
                  }`,
                })}
              </div>
            </div>
          ) : (
            <div className="hidden md:block" />
          )}

          <div className="hidden items-center justify-end gap-2 md:flex">
            {showsStatsEntry && (
              <DailyStatsPanel />
            )}

            {showsWaffleStatsEntry ? (
              <NavIconButton
                active={isWaffleStatsPanelOpen}
                onClick={handleOpenWaffleStats}
                label="Stats"
                icon={<BarChart3 className="h-4 w-4" />}
              />
            ) : null}

            <NavIconButton
              onClick={() => {
                void handleShareClick();
              }}
              label="Share"
              icon={<Share2 className="h-4 w-4" />}
            />

            {helpVisible ? (
              <NavIconButton
                onClick={scrollToHelp}
                label="Help"
                icon={<CircleHelp className="h-4 w-4" />}
              />
            ) : null}

            <UserMenu />
          </div>
        </div>

        {shouldShowModeSwitch && (
          <div className="md:hidden">
            <div className="grid grid-cols-2 rounded-2xl border border-violet-100 bg-white/90 p-1 shadow-[0_10px_30px_rgba(139,92,246,0.08)]">
              {renderModeButton({
                nextMode: 'daily',
                label: isWafflePage ? 'Daily' : 'Daily',
                icon: <Sparkles className="h-4 w-4" />,
                className: `inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all ${
                  activeMode === 'daily'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-violet-700 hover:bg-violet-50'
                }`,
              })}
              {renderModeButton({
                nextMode: 'unlimited',
                label: 'Unlimited',
                icon: <Infinity className="h-4 w-4" />,
                className: `inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all ${
                  activeMode === 'unlimited'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-violet-700 hover:bg-violet-50'
                }`,
              })}
            </div>
          </div>
        )}
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
