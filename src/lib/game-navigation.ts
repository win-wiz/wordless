export type HeaderGameMode = "daily" | "unlimited";

export type GameNavigationSource = "local" | "embedded";

export type GameNavigationIcon =
  | "sparkles"
  | "waffle"
  | "kitchen"
  | "stack"
  | "strands";

export type GameNavigationItem = {
  href: string;
  icon: GameNavigationIcon;
  id: string;
  includeInMobileSidebar: boolean;
  includeInMoreGames: boolean;
  modeSupport: "toggle" | "none";
  shortTitle: string;
  source: GameNavigationSource;
  title: string;
};

export const GAME_NAVIGATION_ITEMS: readonly GameNavigationItem[] = [
  {
    id: "wordless",
    title: "Wordless",
    shortTitle: "Wordless",
    href: "/",
    source: "local",
    icon: "sparkles",
    modeSupport: "toggle",
    includeInMobileSidebar: true,
    includeInMoreGames: true,
  },
  {
    id: "waffle",
    title: "Waffle",
    shortTitle: "Waffle",
    href: "/waffle-game",
    source: "local",
    icon: "waffle",
    modeSupport: "toggle",
    includeInMobileSidebar: true,
    includeInMoreGames: true,
  },
  {
    id: "stack",
    title: "Stack",
    shortTitle: "Stack",
    href: "/stack-game",
    source: "local",
    icon: "stack",
    modeSupport: "none",
    includeInMobileSidebar: false,
    includeInMoreGames: true,
  },
  {
    id: "strands",
    title: "Strands",
    shortTitle: "Strands",
    href: "/strands-game",
    source: "local",
    icon: "strands",
    modeSupport: "none",
    includeInMobileSidebar: true,
    includeInMoreGames: true,
  },
  {
    id: "emoji-kitchen",
    title: "Emoji Kitchen Game",
    shortTitle: "Emoji Kitchen",
    href: "/emoji-kitchen-game",
    source: "embedded",
    icon: "kitchen",
    modeSupport: "none",
    includeInMobileSidebar: true,
    includeInMoreGames: true,
  },
] as const;

export function getGameHref(item: GameNavigationItem, mode: HeaderGameMode) {
  if (item.modeSupport !== "toggle" || mode === "daily") {
    return item.href;
  }

  return `${item.href}?mode=unlimited`;
}

export function isGameActive(item: GameNavigationItem, pathname: string) {
  return pathname === item.href;
}
