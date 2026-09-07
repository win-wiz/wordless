
import { type Metadata } from 'next';
import ScrollConfig from '@/app/(iframs)/ScrollConfig';

export const metadata: Metadata = {
  title: 'Waffle Game - Play Daily Waffle Online Free | Wordless',
  description:
    'Play Waffle Game online for free. Solve 6 connected five-letter words in 15 swaps. Play the daily puzzle or keep going in unlimited mode, right in your browser.',
  keywords:
    'waffle game, play waffle game online, daily waffle, waffle unlimited, word puzzle game, five-letter word game',
  creator: 'Wordless Game Team',
  publisher: 'Wordless Game',
  robots: 'index, follow',
  openGraph: {
    title: 'Waffle Game - Play Daily Waffle Online Free | Wordless',
    description:
      'Play Waffle Game online for free. Solve 6 connected five-letter words in 15 swaps. Play the daily puzzle or keep going in unlimited mode, right in your browser.',
    type: 'website',
    siteName: 'Wordless Game',
  },
};

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ScrollConfig>{children}</ScrollConfig>;
} 
