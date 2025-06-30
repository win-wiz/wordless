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

    const loadSidebarAds = () => {
      try {
        const checkAndLoad = () => {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            // 左侧广告
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            // 右侧广告
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            
            // 先显示广告位，无论是否有广告内容
            setShowAds(true);
            
            // 检查广告是否加载成功（可选）
            setTimeout(() => {
              const leftAd = document.querySelector('.sidebar-left-ad .adsbygoogle');
              const rightAd = document.querySelector('.sidebar-right-ad .adsbygoogle');
              
              if ((leftAd && leftAd.clientHeight > 0) || (rightAd && rightAd.clientHeight > 0)) {
                console.log('侧边栏广告加载成功');
              } else {
                console.log('侧边栏广告暂时无内容，保持占位');
              }
            }, 3000);
          } else {
            // AdSense脚本还没加载完成，继续等待
            setTimeout(checkAndLoad, 1000);
          }
        };

        setTimeout(checkAndLoad, 1500);
      } catch (err) {
        console.error('Sidebar ads error:', err);
        // 即使出错也显示占位
        setShowAds(true);
      }
    };

    loadSidebarAds();
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
            data-ad-slot="f08c47fec0942fa0"
            data-ad-format="auto"
            data-full-width-responsive="true"
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
            data-ad-slot="f08c47fec0942fa0"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </>
  );
});

export default SidebarAds; 