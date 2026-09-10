export type HeaderGameMode = "daily" | "unlimited";

export type GameNavigationSource = "local" | "embedded";

export type GameNavigationIcon =
  | "sparkles"
  | "waffle"
  | "kitchen"
  | "stack"
  | "strands"
  | "memory";

export type GameNavigationItem = {
  href: string;
  icon: GameNavigationIcon;
  id: string;
  includeInMobileSidebar: boolean;
  includeInMoreGames: boolean;
  isNew?: boolean;
  modeSupport: "toggle" | "none";
  shortTitle: string;
  source: GameNavigationSource;
  tagline: string;
  title: string;
};

export const GAME_NAVIGATION_ITEMS: readonly GameNavigationItem[] = [
  {
    id: "wordless",
    title: "Wordless",
    shortTitle: "Wordless",
    tagline: "Daily word challenge, every day",
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
    tagline: "Swap letters to complete every word",
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
    tagline: "Clear the word layers with clues",
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
    tagline: "Find themed words hidden in the grid",
    href: "/strands-game",
    source: "local",
    icon: "strands",
    isNew: true,
    modeSupport: "toggle",
    includeInMobileSidebar: true,
    includeInMoreGames: true,
  },
  {
    id: "emoji-kitchen",
    title: "Emoji Kitchen Game",
    shortTitle: "Emoji Kitchen",
    tagline: "Mix emojis into brand-new creations",
    href: "/emoji-kitchen-game",
    source: "embedded",
    icon: "kitchen",
    modeSupport: "none",
    includeInMobileSidebar: true,
    includeInMoreGames: true,
  },
  {
    id: "emoji-memory",
    title: "Emoji Memory Game",
    shortTitle: "Emoji Memory",
    tagline: "Match emoji pairs and train your brain",
    href: "/emoji-memory-game",
    source: "embedded",
    icon: "memory",
    modeSupport: "none",
    includeInMobileSidebar: false,
    includeInMoreGames: false,
  },
] as const;

export function getGameByPathname(pathname: string) {
  return GAME_NAVIGATION_ITEMS.find((item) => isGameActive(item, pathname));
}

export function getGameHref(item: GameNavigationItem, mode: HeaderGameMode) {
  if (item.modeSupport !== "toggle" || mode === "daily") {
    return item.href;
  }

  return `${item.href}?mode=unlimited`;
}

export function isGameActive(item: GameNavigationItem, pathname: string) {
  if (pathname === item.href) {
    return true;
  }

  return item.href !== "/" && pathname.startsWith(`${item.href}/`);
}
