'use client';

import { memo } from 'react';
import {
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Link,
  Send,
  Share2,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

import type { ShareOption } from './types';

function getActionButtonClassName(isWaffleTheme: boolean, defaultClassName?: string) {
  return cn(
    'flex items-center justify-center gap-2 rounded-xl py-3',
    isWaffleTheme
      ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      : defaultClassName ?? 'bg-white hover:bg-gray-50',
  );
}

interface SharePrimaryActionsSectionProps {
  copied: boolean;
  copiedLink: boolean;
  copyLink: () => void;
  copyText: () => void;
  downloadShareImage: () => void;
  gameResult: boolean;
  isDownloadingImage: boolean;
  isPreparingShareImage: boolean;
  isSharingImage: boolean;
  isWaffleTheme: boolean;
  shareImage: () => void;
  shareOnTwitter: () => void;
  shareViaWebApi: () => void | Promise<void>;
}

export const SharePrimaryActionsSection = memo(function SharePrimaryActionsSection({
  copied,
  copiedLink,
  copyLink,
  copyText,
  downloadShareImage,
  gameResult,
  isDownloadingImage,
  isPreparingShareImage,
  isSharingImage,
  isWaffleTheme,
  shareImage,
  shareOnTwitter,
  shareViaWebApi,
}: SharePrimaryActionsSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className={cn('mb-3 text-sm font-medium', isWaffleTheme ? 'text-slate-700' : 'text-gray-700')}>
        {gameResult ? 'Main Actions' : 'Share Assets'}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {gameResult ? (
          <>
            <Button
              variant="outline"
              onClick={shareImage}
              disabled={isPreparingShareImage || isSharingImage}
              className={getActionButtonClassName(isWaffleTheme, 'hover:bg-gray-50')}
            >
              <ImageIcon size={16} />
              {isSharingImage ? 'Sharing...' : 'Share Image'}
            </Button>

            <Button
              variant="outline"
              onClick={downloadShareImage}
              disabled={isPreparingShareImage || isDownloadingImage}
              className={getActionButtonClassName(isWaffleTheme, 'hover:bg-gray-50')}
            >
              <Download size={16} />
              {isDownloadingImage ? 'Downloading...' : 'Download PNG'}
            </Button>

            <Button
              variant="outline"
              onClick={shareOnTwitter}
              className={cn(
                'col-span-2 flex items-center justify-center gap-2 rounded-xl py-3',
                isWaffleTheme
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'bg-white hover:bg-gray-50',
              )}
            >
              <Send size={16} />
              Share to Twitter
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={shareViaWebApi}
              className={cn(
                'col-span-2 flex items-center justify-center gap-2 rounded-xl py-3',
                isWaffleTheme
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'bg-white hover:bg-gray-50',
              )}
            >
              <Share2 size={16} />
              Share Now
            </Button>

            <Button
              variant="outline"
              onClick={copyText}
              className={getActionButtonClassName(isWaffleTheme, 'hover:bg-gray-50')}
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>

            <Button
              variant="outline"
              onClick={copyLink}
              className={getActionButtonClassName(isWaffleTheme, 'hover:bg-gray-50')}
            >
              {copiedLink ? <Check size={16} className="text-green-600" /> : <Link size={16} />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

interface ShareDestinationsSectionProps {
  isWaffleTheme: boolean;
  options: ShareOption[];
}

export const ShareDestinationsSection = memo(function ShareDestinationsSection({
  isWaffleTheme,
  options,
}: ShareDestinationsSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className={cn('text-sm font-medium', isWaffleTheme ? 'text-slate-700' : 'text-gray-700')}>
        Share Destinations
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            onClick={option.action}
            className={cn(
              'h-auto flex-col gap-2 rounded-xl border-2 p-4 transition-all duration-200',
              isWaffleTheme && 'border-slate-200 bg-white text-slate-700',
              option.color,
            )}
          >
            <option.icon size={24} />
            <span className="text-sm font-medium">{option.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});

interface ShareMoreOptionsSectionProps {
  copied: boolean;
  copiedLink: boolean;
  copyLink: () => void;
  copyText: () => void;
  isWaffleTheme: boolean;
  options: ShareOption[];
}

export const ShareMoreOptionsSection = memo(function ShareMoreOptionsSection({
  copied,
  copiedLink,
  copyLink,
  copyText,
  isWaffleTheme,
  options,
}: ShareMoreOptionsSectionProps) {
  return (
    <details className="group rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-3">
      <summary
        className={cn(
          'flex cursor-pointer items-center justify-between gap-3 text-sm font-medium',
          isWaffleTheme ? 'text-slate-600 hover:text-slate-800' : 'text-gray-600 hover:text-gray-800',
        )}
      >
        <span>More options</span>
        <span className="text-xs text-zinc-400 transition-transform group-open:rotate-180">⌄</span>
      </summary>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={copyText} className={getActionButtonClassName(isWaffleTheme)}>
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Text'}
        </Button>

        <Button variant="outline" onClick={copyLink} className={getActionButtonClassName(isWaffleTheme)}>
          {copiedLink ? <Check size={16} className="text-green-600" /> : <Link size={16} />}
          {copiedLink ? 'Copied!' : 'Copy Link'}
        </Button>

        {options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            onClick={option.action}
            className={getActionButtonClassName(isWaffleTheme)}
          >
            <option.icon size={16} />
            <span>{option.name}</span>
          </Button>
        ))}
      </div>
    </details>
  );
});
