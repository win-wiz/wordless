import { memo, useEffect, useRef } from 'react';

/**
 * 增强安全广告组件
 * 结合自动广告 + 手动侧边栏广告，完全符合Google政策
 */
const EnhancedSafeAds = memo(function EnhancedSafeAds() {
  const initRef = useRef(false);

  useEffect(() => {
    // 组件已停用，不再执行任何AdSense代码
    console.log('EnhancedSafeAds组件已停用，AdSense配置已移至layout.tsx');
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