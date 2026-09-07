'use client';

import Image from 'next/image';
import { memo } from 'react';

import { cn } from '@/lib/utils';

import type { ShareDialogPreviewCard } from './types';

interface ShareImagePreviewSectionProps {
  isPreparingShareImage: boolean;
  isWaffleTheme: boolean;
  shareImagePreviewUrl: string | null;
}

export const ShareImagePreviewSection = memo(function ShareImagePreviewSection({
  isPreparingShareImage,
  isWaffleTheme,
  shareImagePreviewUrl,
}: ShareImagePreviewSectionProps) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          'overflow-hidden rounded-[24px] border shadow-sm',
          isWaffleTheme
            ? 'border-slate-200 bg-slate-50'
            : 'border-violet-100 bg-gradient-to-br from-violet-50 via-white to-rose-50',
        )}
      >
        <div className="relative aspect-[4/5] w-full">
          {shareImagePreviewUrl ? (
            <Image
              src={shareImagePreviewUrl}
              alt="Share image preview"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6">
              <div className="space-y-3 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-500" />
                <p className={cn('text-sm', isWaffleTheme ? 'text-slate-500' : 'text-gray-500')}>
                  {isPreparingShareImage ? 'Preparing image preview...' : 'Image preview unavailable'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

interface SharePreviewSectionProps {
  isWaffleTheme: boolean;
  previewCard?: ShareDialogPreviewCard;
  shareText: string;
  shareUrl: string;
}

export const SharePreviewSection = memo(function SharePreviewSection({
  isWaffleTheme,
  previewCard,
  shareText,
  shareUrl,
}: SharePreviewSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className={cn('text-sm font-medium', isWaffleTheme ? 'text-slate-700' : 'text-gray-700')}>
        Preview share content
      </h3>

      {previewCard ? (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#312e81_100%)] p-4 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              {previewCard.eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/90">
                  {previewCard.eyebrow}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {previewCard.recordLabel ? (
                  <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/95">
                    {previewCard.recordLabel}
                  </div>
                ) : null}
                {previewCard.scoreLabel ? (
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    {previewCard.scoreLabel}
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
                {previewCard.headline}
              </p>
            </div>
            <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100">
              Share Card
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-sm">
            <pre className="overflow-x-auto whitespace-pre text-center font-mono text-lg leading-[1.2] tracking-[0.08em] text-white sm:text-xl">
              {previewCard.emojiBoard}
            </pre>
          </div>

          {previewCard.highlights && previewCard.highlights.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {previewCard.highlights.map((highlight, index) => (
                <span
                  key={`${highlight}-${index}`}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-[0.01em] text-blue-50"
                >
                  {highlight}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/80">
                {previewCard.footerLabel ?? 'Play it here'}
              </p>
              <p className="mt-1 truncate text-sm text-white/85">{shareUrl}</p>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
              Wordless
            </div>
          </div>
        </div>
      ) : null}

      <details className="group">
        <summary
          className={cn(
            'flex cursor-pointer items-center gap-2 text-sm',
            isWaffleTheme ? 'text-slate-500 hover:text-slate-700' : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <span>{previewCard ? 'View raw share text' : 'Preview share content'}</span>
        </summary>
        <div
          className={cn(
            'mt-3 max-h-40 overflow-y-auto rounded-xl border p-4 text-xs whitespace-pre-line',
            isWaffleTheme ? 'border-slate-200 bg-slate-50 text-slate-700' : 'bg-gray-50 text-gray-700',
          )}
        >
          {shareText}
        </div>
      </details>
    </div>
  );
});
