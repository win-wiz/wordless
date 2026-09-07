'use client';

import { useEffect } from 'react';

type AdSensePageLevelConfig = {
  enable_page_level_ads: boolean;
  google_ad_client: string;
};

type AdSenseQueue = {
  push: (config: AdSensePageLevelConfig) => unknown;
};

declare global {
  interface Window {
    adsbygoogle?: AdSenseQueue;
    adsbygoogle_page_level_initialized?: boolean;
  }
}

const ADSENSE_CLIENT = 'ca-pub-1939625526338391';
const ADSENSE_SCRIPT_ID = 'wordless-adsense-script';

export default function AdSenseInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let scriptElement = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;

    const initializeAdSense = () => {
      if (cancelled || window.adsbygoogle_page_level_initialized) {
        return;
      }

      try {
        const adsbygoogle = window.adsbygoogle;

        if (!adsbygoogle || typeof adsbygoogle.push !== 'function') {
          retryTimer = setTimeout(initializeAdSense, 100);
          return;
        }

        adsbygoogle.push({
          google_ad_client: ADSENSE_CLIENT,
          enable_page_level_ads: true,
        });
        window.adsbygoogle_page_level_initialized = true;
      } catch (error) {
        console.error('Failed to initialize AdSense:', error);
      }
    };

    const handleScriptLoad = () => {
      retryTimer = setTimeout(initializeAdSense, 100);
    };

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = ADSENSE_SCRIPT_ID;
      scriptElement.async = true;
      scriptElement.crossOrigin = 'anonymous';
      scriptElement.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.appendChild(scriptElement);
    }

    scriptElement.addEventListener('load', handleScriptLoad);

    if (scriptElement.dataset.loaded === 'true') {
      handleScriptLoad();
    } else {
      scriptElement.addEventListener('load', () => {
        scriptElement!.dataset.loaded = 'true';
      }, { once: true });
    }

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      scriptElement?.removeEventListener('load', handleScriptLoad);
    };
  }, []);

  return null;
} 
