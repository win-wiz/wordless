
import { type Metadata } from 'next';
import ScrollConfig from '@/app/(iframs)/ScrollConfig';

export const metadata: Metadata = {
  title: 'Emoji Kitchen Game - Mix & Create Unique AI Emoji Blends',
  description:
    'Play Emoji Kitchen Game for free! Mix any two emojis to create unique combinations with AI. Save and share your custom emoji blends instantly on any device.',
  keywords:
    'emoji kitchen game, emoji combinations, emoji mixer, custom emoji creator, AI emoji generator, emoji blending app, creative emoji maker, emoji fusion tool, mix emojis online, emoji kitchen app, unique emoji designs, emoji mashup, emoji combination generator, emoji creation platform, emoji kitchen online',
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