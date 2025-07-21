
import { type Metadata } from 'next';
import ScrollConfig from '@/app/(iframs)/ScrollConfig';

export const metadata: Metadata = {
  title: 'Waffle Game - Online Word Puzzle with AI Hints',
  description:
    'Play Waffle Game online free! Solve word puzzles in 15 moves with AI hints. Master this engaging brain game with custom themes and daily challenges.',
  keywords:
    'waffle game, word puzzle, online game, AI hints, brain games, word challenge, puzzle game, free games',
  creator: 'Waffle Game',
  publisher: 'Waffle Game Platform',
  robots: 'index, follow',
};

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ScrollConfig>{children}</ScrollConfig>;
} 