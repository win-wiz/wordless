import { memo, useEffect, useState, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  slot?: string;
  position?: 'top' | 'middle' | 'bottom';
}

const AdBanner = memo(function AdBanner({ 
  className = "", 
  slot = "f08c47fec0942fa0",
  position = 'middle'
}: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 使用 Intersection Observer 检测元素是否进入视口
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            loadAd();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (adRef.current) {
      observerRef.current.observe(adRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isVisible]);

  const loadAd = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        const timer = setTimeout(() => {
          const adElement = adRef.current?.querySelector('.adsbygoogle');
          if (adElement && !(adElement as any).dataset.adsbygoogleStatus) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            
            // 检测广告是否成功加载
            setTimeout(() => {
              const adHeight = adElement.clientHeight;
              if (adHeight > 0) {
                setAdLoaded(true);
                setShowAd(true);
              } else {
                // 广告没有加载成功，隐藏整个组件
                setShowAd(false);
              }
            }, 2000);
          }
        }, 500);

        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error('AdSense error:', err);
      setShowAd(false);
    }
  };

  // 如果广告没有加载成功或不需要显示，返回 null
  if (!showAd && isVisible) {
    return null;
  }

  // 如果还没有进入视口，显示一个最小高度的占位符用于观察
  if (!isVisible) {
    return (
      <div 
        ref={adRef}
        className="w-full"
        style={{ height: '1px', overflow: 'hidden' }}
      />
    );
  }

  return (
    <div 
      ref={adRef}
      className={`w-full flex justify-center transition-all duration-300 ${
        adLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        minHeight: adLoaded ? 'auto' : '100px',
      }}
    >
      <div className="max-w-4xl w-full">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            minHeight: '100px',
            backgroundColor: 'transparent',
            transition: 'all 0.3s ease'
          }}
          data-ad-client="ca-pub-1939625526338391"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
});

export default AdBanner; 