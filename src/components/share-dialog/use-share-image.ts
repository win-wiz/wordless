'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createWordlessShareImageBlob,
  type WordlessShareImageGameResult,
} from '@/lib/wordless-share-image';

interface UseShareImageOptions {
  gameResult?: WordlessShareImageGameResult;
  isOpen: boolean;
  shareUrl: string;
}

function revokeObjectUrl(url: string | null) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function useShareImage({
  gameResult,
  isOpen,
  shareUrl,
}: UseShareImageOptions) {
  const [shareImagePreviewUrl, setShareImagePreviewUrl] = useState<string | null>(null);
  const [isPreparingShareImage, setIsPreparingShareImage] = useState(false);

  const blobCacheRef = useRef<Blob | null>(null);
  const pendingBlobRef = useRef<Promise<Blob> | null>(null);

  const resetShareImageState = useCallback(() => {
    blobCacheRef.current = null;
    pendingBlobRef.current = null;
    setIsPreparingShareImage(false);
    setShareImagePreviewUrl((currentUrl) => {
      revokeObjectUrl(currentUrl);
      return null;
    });
  }, []);

  const getShareImageBlob = useCallback(async () => {
    if (!gameResult) {
      throw new Error('Game result is unavailable.');
    }

    if (blobCacheRef.current) {
      return blobCacheRef.current;
    }

    if (pendingBlobRef.current) {
      return pendingBlobRef.current;
    }

    const nextBlobPromise = createWordlessShareImageBlob({ gameResult, shareUrl })
      .then((blob) => {
        blobCacheRef.current = blob;
        return blob;
      })
      .finally(() => {
        pendingBlobRef.current = null;
      });

    pendingBlobRef.current = nextBlobPromise;
    return nextBlobPromise;
  }, [gameResult, shareUrl]);

  useEffect(() => {
    let active = true;
    let nextObjectUrl: string | null = null;

    if (!isOpen || !gameResult) {
      resetShareImageState();
      return;
    }

    setIsPreparingShareImage(true);

    getShareImageBlob()
      .then((blob) => {
        if (!active) {
          return;
        }

        nextObjectUrl = URL.createObjectURL(blob);
        setShareImagePreviewUrl((currentUrl) => {
          revokeObjectUrl(currentUrl);
          return nextObjectUrl;
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        console.error('Failed to prepare share image:', error);
        blobCacheRef.current = null;
        setShareImagePreviewUrl((currentUrl) => {
          revokeObjectUrl(currentUrl);
          return null;
        });
      })
      .finally(() => {
        if (active) {
          setIsPreparingShareImage(false);
        }
      });

    return () => {
      active = false;
      revokeObjectUrl(nextObjectUrl);
    };
  }, [gameResult, getShareImageBlob, isOpen, resetShareImageState]);

  return {
    getShareImageBlob,
    isPreparingShareImage,
    shareImagePreviewUrl,
  };
}
