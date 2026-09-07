'use client';

import { memo } from 'react';
import { Share2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import { DialogHeader, DialogTitle } from '../ui/dialog';

import type { ShareDialogSummary } from './types';

interface ShareDialogHeaderProps {
  description: string;
  isWaffleTheme: boolean;
  title: string;
}

export const ShareDialogHeader = memo(function ShareDialogHeader({
  description,
  isWaffleTheme,
  title,
}: ShareDialogHeaderProps) {
  return (
    <DialogHeader
      className={cn(
        'shrink-0 border-b px-6 py-4',
        isWaffleTheme
          ? 'gap-3 border-slate-100 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_42%),linear-gradient(to_bottom,_rgba(248,250,252,0.95),_white_68%)] pb-5 pt-6 text-left sm:text-left'
          : 'border-gray-100 bg-gradient-to-r from-violet-50 to-blue-50',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'rounded-full p-2',
              isWaffleTheme
                ? 'flex h-11 w-11 items-center justify-center bg-blue-100 text-blue-600 shadow-[0_10px_24px_rgba(59,130,246,0.2)]'
                : 'bg-violet-100',
            )}
          >
            <Share2 className={cn('h-4 w-4', isWaffleTheme ? 'text-blue-600' : 'text-violet-600')} />
          </div>
          <DialogTitle
            className={cn(
              'font-semibold',
              isWaffleTheme
                ? 'text-[1.8rem] leading-[1.05] tracking-[-0.04em] text-slate-950'
                : 'text-lg text-gray-800',
            )}
          >
            {title}
          </DialogTitle>
        </div>
      </div>
      <p className={cn('mt-1 text-sm', isWaffleTheme ? 'leading-6 text-slate-500' : 'text-gray-600')}>
        {description}
      </p>
    </DialogHeader>
  );
});

interface ShareSummarySectionProps {
  isWaffleTheme: boolean;
  summary: ShareDialogSummary;
}

export const ShareSummarySection = memo(function ShareSummarySection({
  isWaffleTheme,
  summary,
}: ShareSummarySectionProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        isWaffleTheme
          ? 'border border-slate-200 bg-slate-50'
          : 'border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50',
      )}
    >
      {summary.eyebrow ? (
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.16em]',
            isWaffleTheme ? 'text-blue-500' : 'text-violet-500',
          )}
        >
          {summary.eyebrow}
        </p>
      ) : null}
      <p
        className={cn(
          'mt-2 font-semibold tracking-[-0.03em]',
          isWaffleTheme ? 'text-xl text-slate-950' : 'text-lg text-gray-900',
        )}
      >
        {summary.headline}
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {summary.items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'rounded-xl px-3 py-3 shadow-sm',
              isWaffleTheme ? 'border border-slate-200 bg-white' : 'border border-white/80 bg-white/90',
            )}
          >
            <p
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.12em]',
                isWaffleTheme ? 'text-slate-400' : 'text-gray-400',
              )}
            >
              {item.label}
            </p>
            <p className={cn('mt-1 text-sm font-semibold', isWaffleTheme ? 'text-slate-900' : 'text-gray-900')}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});
