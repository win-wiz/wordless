import { memo, useEffect, useRef } from 'react';

/**
 * 增强安全广告组件
 * 结合自动广告 + 手动侧边栏广告，完全符合Google政策
 */
const EnhancedSafeAds = memo(function EnhancedSafeAds() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;

    const initializeAds = () => {
      try {
        const checkReady = () => {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            
            // 1. 标准自动广告
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
              google_ad_client: "ca-pub-1939625526338391",
              enable_page_level_ads: true
            });
            
            // 2. 初始化手动广告（如果存在）
            const manualAds = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
            manualAds.forEach((ad) => {
              try {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
              } catch (e) {
                console.log('手动广告初始化:', e);
              }
            });
            
            initRef.current = true;
            console.log('✅ 增强安全广告已启用（自动+手动）');
            
          } else {
            setTimeout(checkReady, 100);
          }
        };

        checkReady();
      } catch (error) {
        console.error('增强广告初始化失败:', error);
      }
    };

    const timer = setTimeout(initializeAds, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 手动侧边栏广告 - 仅在大屏幕显示 */}
      <div className="hidden xl:block fixed right-4 top-20 z-10">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '300px',
            height: '250px'
          }}
          data-ad-client="ca-pub-1939625526338391"
          data-ad-slot="1234567890"  // 请替换为您实际的广告位ID
          data-ad-format="auto"
        />
      </div>

      {/* 手动底部广告 - 移动端友好 */}
      <div className="block xl:hidden sticky bottom-0 bg-white p-2 border-t z-10">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            height: '60px'
          }}
          data-ad-client="ca-pub-1939625526338391"
          data-ad-slot="0987654321"  // 请替换为您实际的广告位ID
          data-ad-format="auto"
        />
      </div>
    </>
  );
});

export default EnhancedSafeAds; 