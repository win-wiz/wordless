import type { LucideIcon } from 'lucide-react';

import type { WordlessShareImageGameResult } from '@/lib/wordless-share-image';

export type ShareDialogTheme = 'default' | 'waffle';

export interface ShareDialogSummaryItem {
  label: string;
  value: string;
}

export interface ShareDialogSummary {
  eyebrow?: string;
  headline: string;
  items: ShareDialogSummaryItem[];
}

export interface ShareDialogPreviewCard {
  eyebrow?: string;
  headline: string;
  emojiBoard: string;
  highlights?: string[];
  recordLabel?: string;
  scoreLabel?: string;
  footerLabel?: string;
}

export interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  theme?: ShareDialogTheme;
  customShareText?: string;
  url?: string;
  wordLength?: number;
  summary?: ShareDialogSummary;
  previewCard?: ShareDialogPreviewCard;
  gameResult?: WordlessShareImageGameResult;
}

export interface ShareOption {
  id: 'twitter' | 'facebook' | 'linkedin' | 'email';
  name: string;
  icon: LucideIcon;
  color: string;
  action: () => void;
}
