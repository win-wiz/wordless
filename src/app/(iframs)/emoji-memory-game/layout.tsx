
import { type Metadata } from 'next';
import ScrollConfig from '@/app/(iframs)/ScrollConfig';

export const metadata: Metadata = {
  title: 'Emoji Memory Game - Free Online Brain Training Challenge',
  description:
    'Play Emoji Memory Game online! Test memory skills with colorful emoji cards, multiple difficulty levels. Perfect for all ages - improve concentration.',
  keywords:
    'emoji memory game, memory game online, brain training games, cognitive enhancement, emoji matching game, memory challenge, online memory games, free brain games, concentration training, mental agility games, emoji cards memory, memory test online, brain exercise games, cognitive development, memory improvement games',
  creator: 'Wordless Games',
  publisher: 'Wordless Games',
  robots: 'index, follow',
};

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ScrollConfig>{children}</ScrollConfig>;
}