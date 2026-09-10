import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Strands Game - Play Daily Strands Online Free | Wordless",
  description:
    "Play Strands Game online free — a daily word search with a twist. Find themed words and the spangram in a 6×8 grid, or play unlimited practice boards.",
  keywords:
    "strands game, play strands online, strands game online free, strands unlimited, daily strands puzzle, word search game, spangram, how to play strands, nyt strands style game",
  creator: "Wordless Game Team",
  publisher: "Wordless Game",
  robots: "index, follow",
  openGraph: {
    title: "Strands Game - Play Daily Strands Online Free | Wordless",
    description:
      "Play Strands Game online free — a daily word search with a twist. Find themed words and the spangram in a 6×8 grid, or play unlimited practice boards.",
    type: "website",
    siteName: "Wordless Game",
  },
};

export default function StrandsGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
