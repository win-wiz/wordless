import { memo, useEffect, useState } from 'react';

const SidebarAds = memo(function SidebarAds() {
  const [showAds, setShowAds] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1400; // 只在超大屏幕显示
      setIsLargeScreen(isLarge);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    if (!isLargeScreen) return;

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          // 左侧广告
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          // 右侧广告
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          
          setTimeout(() => {
            const leftAd = document.querySelector('.sidebar-left-ad .adsbygoogle');
            const rightAd = document.querySelector('.sidebar-right-ad .adsbygoogle');
            
            if ((leftAd && leftAd.clientHeight > 0) || (rightAd && rightAd.clientHeight > 0)) {
              setShowAds(true);
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Sidebar ads error:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLargeScreen]);

  if (!isLargeScreen || !showAds) {
    return null;
  }

  return (
    <>
      {/* 左侧广告 */}
      <div className="sidebar-left-ad fixed left-4 top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-500 opacity-100">
        <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
          <ins 
            className="adsbygoogle"
            style={{ 
              display: 'block',
              width: '160px',
              height: '600px'
            }}
            data-ad-client="ca-pub-1939625526338391"
            data-ad-slot="sidebar-left-slot"
            data-ad-format="vertical"
          />
        </div>
      </div>

      {/* 右侧广告 */}
      <div className="sidebar-right-ad fixed right-4 top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-500 opacity-100">
        <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
          <ins 
            className="adsbygoogle"
            style={{ 
              display: 'block',
              width: '160px',
              height: '600px'
            }}
            data-ad-client="ca-pub-1939625526338391"
            data-ad-slot="sidebar-right-slot"
            data-ad-format="vertical"
          />
        </div>
      </div>
    </>
  );
});

export default SidebarAds; 