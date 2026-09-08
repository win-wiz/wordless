import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Strands Game - Play Daily Strands Online Free | Wordless",
  description:
    "Play Strands online for free. Find themed words and the spangram hidden in a 6×8 letter grid. Play the daily puzzle or practice with unlimited random boards, right in your browser.",
  keywords:
    "strands game, play strands online, daily strands, nyt strands style game, word search puzzle, spangram game",
  creator: "Wordless Game Team",
  publisher: "Wordless Game",
  robots: "index, follow",
  openGraph: {
    title: "Strands Game - Play Daily Strands Online Free | Wordless",
    description:
      "Play Strands online for free. Find themed words and the spangram hidden in a 6×8 letter grid. Play the daily puzzle or practice with unlimited random boards, right in your browser.",
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
