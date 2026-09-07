'use client';

import { useMemo } from 'react';

import { cn, formatTime, generateQuickShareText } from '@/lib/utils';

import { Dialog, DialogContent } from './ui/dialog';
import {
  ShareDialogHeader,
  SharePrimaryActionsSection,
  ShareDestinationsSection,
  ShareMoreOptionsSection,
  ShareImagePreviewSection,
  SharePreviewSection,
  ShareSummarySection,
} from './share-dialog/index';
import { useShareActions } from './share-dialog/use-share-actions';
import { useShareImage } from './share-dialog/use-share-image';
import type { ShareDialogProps } from './share-dialog/types';

function buildGameResultShareText(shareUrl: string, gameResult: NonNullable<ShareDialogProps['gameResult']>) {
  const { isWin, attempts, maxAttempts, totalTime, pattern, communityStats } = gameResult;
  const kicker = isWin ? 'ROUND COMPLETE' : 'ROUND OVER';
  const headline = isWin ? 'You Won!' : 'Challenge Incomplete';
  const subline = isWin
    ? "Amazing work! You've mastered this challenge!"
    : 'Out of attempts this time.';
  const statsLine = `Attempts ${attempts}/${maxAttempts} | Time ${formatTime(totalTime)}`;
  const communityLine =
    communityStats && communityStats.totalCompleted > 0
      ? `${communityStats.totalCompleted} players finished | ${communityStats.totalWins} solved`
      : null;

  return [
    kicker,
    headline,
    subline,
    '',
    statsLine,
    communityLine,
    pattern ? '' : null,
    pattern ?? null,
    '',
    `Play Wordless Game: ${shareUrl}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

export function ShareDialog({
  isOpen,
  onClose,
  title = 'Share Wordless Game',
  description = 'Challenge your friends with this word puzzle game!',
  theme = 'default',
  customShareText,
  url,
  wordLength = 5,
  summary,
  previewCard,
  gameResult,
}: ShareDialogProps) {
  const shareUrl = useMemo(
    () => url ?? (typeof window !== 'undefined' ? window.location.origin : ''),
    [url],
  );
  const isWaffleTheme = theme === 'waffle';
  const shareText = useMemo(() => {
    if (customShareText) {
      return customShareText;
    }

    if (gameResult) {
      return buildGameResultShareText(shareUrl, gameResult);
    }

    return generateQuickShareText(wordLength);
  }, [customShareText, gameResult, shareUrl, wordLength]);

  const {
    getShareImageBlob,
    isPreparingShareImage,
    shareImagePreviewUrl,
  } = useShareImage({
    gameResult,
    isOpen,
    shareUrl,
  });

  const {
    copied,
    copiedLink,
    copyLink,
    copyText,
    downloadShareImage,
    isDownloadingImage,
    isSharingImage,
    primaryShareOptions,
    secondaryShareOptions,
    shareImage,
    shareOnTwitter,
    shareViaWebApi,
  } = useShareActions({
    gameResult,
    getShareImageBlob,
    shareText,
    shareUrl,
    title,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'mx-auto flex max-h-[calc(100dvh-2rem)] max-w-[min(94vw,44rem)] flex-col gap-0 overflow-hidden p-0',
          isWaffleTheme
            ? 'rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]'
            : undefined,
        )}
      >
        <ShareDialogHeader
          title={title}
          description={description}
          isWaffleTheme={isWaffleTheme}
        />

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-5">
            {gameResult ? (
              <ShareImagePreviewSection
                shareImagePreviewUrl={shareImagePreviewUrl}
                isPreparingShareImage={isPreparingShareImage}
                isWaffleTheme={isWaffleTheme}
              />
            ) : null}

            {summary ? (
              <ShareSummarySection summary={summary} isWaffleTheme={isWaffleTheme} />
            ) : null}

            <SharePrimaryActionsSection
              copied={copied}
              copiedLink={copiedLink}
              copyLink={copyLink}
              copyText={copyText}
              downloadShareImage={downloadShareImage}
              gameResult={Boolean(gameResult)}
              isDownloadingImage={isDownloadingImage}
              isPreparingShareImage={isPreparingShareImage}
              isSharingImage={isSharingImage}
              isWaffleTheme={isWaffleTheme}
              shareImage={shareImage}
              shareOnTwitter={shareOnTwitter}
              shareViaWebApi={shareViaWebApi}
            />

            {!gameResult ? (
              <ShareDestinationsSection
                options={primaryShareOptions}
                isWaffleTheme={isWaffleTheme}
              />
            ) : null}

            {gameResult ? (
              <ShareMoreOptionsSection
                copied={copied}
                copiedLink={copiedLink}
                copyLink={copyLink}
                copyText={copyText}
                isWaffleTheme={isWaffleTheme}
                options={secondaryShareOptions}
              />
            ) : null}

            {!gameResult ? (
              <SharePreviewSection
                previewCard={previewCard}
                shareText={shareText}
                shareUrl={shareUrl}
                isWaffleTheme={isWaffleTheme}
              />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
