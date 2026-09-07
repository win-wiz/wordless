'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Mail,
  Send,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import type { WordlessShareImageGameResult } from '@/lib/wordless-share-image';

import type { ShareOption } from './types';

interface UseShareActionsOptions {
  gameResult?: WordlessShareImageGameResult;
  shareText: string;
  shareUrl: string;
  title: string;
  getShareImageBlob: () => Promise<Blob>;
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

function openPopup(url: string, features: string) {
  const popup = window.open(url, '_blank', `${features},noopener,noreferrer`);
  if (popup) {
    popup.opener = null;
  }

  return popup;
}

function useTransientFlag(duration = 3000) {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const trigger = useCallback(() => {
    setActive(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    active,
    trigger,
  };
}

export function useShareActions({
  gameResult,
  getShareImageBlob,
  shareText,
  shareUrl,
  title,
}: UseShareActionsOptions) {
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const { active: copied, trigger: triggerCopied } = useTransientFlag();
  const { active: copiedLink, trigger: triggerCopiedLink } = useTransientFlag();

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      triggerCopied();
      toast.success('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy content');
    }
  }, [shareText, triggerCopied]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      triggerCopiedLink();
      toast.success('Link copied!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  }, [shareUrl, triggerCopiedLink]);

  const shareViaWebApi = useCallback(async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      await copyText();
      return;
    }

    try {
      await navigator.share({
        title,
        text: shareText,
        url: shareUrl,
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }

      console.error('Failed to share via Web Share API:', error);
      await copyText();
    }
  }, [copyText, shareText, shareUrl, title]);

  const shareImage = useCallback(async () => {
    if (!gameResult) {
      return;
    }

    setIsSharingImage(true);

    try {
      const blob = await getShareImageBlob();
      const fileName = `wordless-${gameResult.isWin ? 'win' : 'result'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const canShareImage =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));

      if (!canShareImage) {
        triggerBlobDownload(blob, fileName);
        toast.success('Image downloaded. You can attach it to your post now.');
        return;
      }

      await navigator.share({
        title,
        text: shareText,
        files: [file],
      });
      toast.success('Image shared successfully!');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to share image:', error);
        toast.error('Failed to share image');
      }
    } finally {
      setIsSharingImage(false);
    }
  }, [gameResult, getShareImageBlob, shareText, title]);

  const downloadShareImage = useCallback(async () => {
    if (!gameResult) {
      return;
    }

    setIsDownloadingImage(true);

    try {
      const blob = await getShareImageBlob();
      triggerBlobDownload(
        blob,
        `wordless-${gameResult.isWin ? 'win' : 'result'}-${gameResult.attempts}-${gameResult.maxAttempts}.png`,
      );
      toast.success('Share image downloaded!');
    } catch (error) {
      console.error('Failed to download share image:', error);
      toast.error('Failed to download share image');
    } finally {
      setIsDownloadingImage(false);
    }
  }, [gameResult, getShareImageBlob]);

  const shareOnTwitter = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;

    if (!gameResult) {
      openPopup(twitterUrl, 'width=550,height=420');
      return;
    }

    const twitterWindow = openPopup('about:blank', 'width=550,height=420');

    void getShareImageBlob()
      .then((blob) => {
        triggerBlobDownload(blob, `wordless-${gameResult.isWin ? 'win' : 'result'}-twitter.png`);
        toast.success('Image downloaded. Attach it in Twitter to keep the guess distribution visible.');
        if (twitterWindow) {
          twitterWindow.location.href = twitterUrl;
          return;
        }

        openPopup(twitterUrl, 'width=550,height=420');
      })
      .catch((error) => {
        console.error('Failed to prepare Twitter share image:', error);
        if (twitterWindow) {
          twitterWindow.location.href = twitterUrl;
          return;
        }

        openPopup(twitterUrl, 'width=550,height=420');
      });
  }, [gameResult, getShareImageBlob, shareText]);

  const shareOnFacebook = useCallback(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    openPopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      'width=580,height=400',
    );
  }, [shareUrl]);

  const shareOnLinkedIn = useCallback(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    openPopup(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
      'width=520,height=570',
    );
  }, [shareText, shareUrl]);

  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent('Check out this word puzzle game!');
    const body = encodeURIComponent(`${shareText}\n\nTry it here: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [shareText, shareUrl]);

  const shareOptions = useMemo<ShareOption[]>(
    () => [
      {
        id: 'twitter',
        name: 'Twitter',
        icon: Send,
        color: 'hover:bg-blue-50 hover:text-blue-600',
        action: shareOnTwitter,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: Users,
        color: 'hover:bg-blue-50 hover:text-blue-700',
        action: shareOnFacebook,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: BriefcaseBusiness,
        color: 'hover:bg-blue-50 hover:text-blue-600',
        action: shareOnLinkedIn,
      },
      {
        id: 'email',
        name: 'Email',
        icon: Mail,
        color: 'hover:bg-gray-50 hover:text-gray-700',
        action: shareViaEmail,
      },
    ],
    [shareOnFacebook, shareOnLinkedIn, shareOnTwitter, shareViaEmail],
  );

  const primaryShareOptions = useMemo(
    () => (gameResult ? shareOptions.filter((option) => option.id === 'twitter') : shareOptions),
    [gameResult, shareOptions],
  );

  const secondaryShareOptions = useMemo(
    () => (gameResult ? shareOptions.filter((option) => option.id !== 'twitter') : []),
    [gameResult, shareOptions],
  );

  return {
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
  };
}
