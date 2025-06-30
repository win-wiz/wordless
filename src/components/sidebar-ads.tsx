import { memo, useEffect, useState, useRef } from 'react';

const SidebarAds = memo(function SidebarAds() {
  const [showAds, setShowAds] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const adsInitialized = useRef(false); // 添加初始化状态跟踪

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
    if (!isLargeScreen || adsInitialized.current) return; // 如果已初始化则跳过

    const loadSidebarAds = () => {
      try {
        const checkAndLoad = () => {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            // 检查广告单元是否已经有内容
            const leftAdElement = document.querySelector('.sidebar-left-ad .adsbygoogle');
            const rightAdElement = document.querySelector('.sidebar-right-ad .adsbygoogle');
            
            // 只有当广告单元存在且没有子元素时才初始化
            if (leftAdElement && !leftAdElement.hasChildNodes()) {
              // 左侧广告
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
            
            if (rightAdElement && !rightAdElement.hasChildNodes()) {
              // 右侧广告
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
            
            // 标记为已初始化
            adsInitialized.current = true;
            
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
        adsInitialized.current = true; // 防止重复尝试
      }
    };

    loadSidebarAds();
  }, [isLargeScreen]);

  // 组件卸载时重置状态
  useEffect(() => {
    return () => {
      adsInitialized.current = false;
    };
  }, []);

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