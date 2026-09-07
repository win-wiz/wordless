import { type Metadata } from "next";

import ScrollConfig from "@/app/(iframs)/ScrollConfig";

export const metadata: Metadata = {
  title: "Stack Game - Clear the Word Layers | Wordless",
  description:
    "Play Stack, a layered 5-letter word puzzle where each correct word reveals the next hidden row.",
  keywords:
    "stack game, 5-letter puzzle, layered word game, word stack puzzle, wordless stack",
  creator: "Wordless Game Team",
  publisher: "Wordless Game",
  robots: "index, follow",
  openGraph: {
    title: "Stack Game - Clear the Word Layers | Wordless",
    description:
      "Play Stack, a layered 5-letter word puzzle where each correct word reveals the next hidden row.",
    type: "website",
    siteName: "Wordless Game",
  },
};

export default function StackGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ScrollConfig>{children}</ScrollConfig>;
}
