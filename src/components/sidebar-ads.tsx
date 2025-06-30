import { memo, useEffect, useState, useRef, useCallback } from 'react';

// 行业标准响应式断点配置
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  large: 1400,
  xlarge: 1600
} as const;

// 广告配置 - 基于行业最佳实践
const AD_CONFIG = {
  left: {
    width: '160px',
    height: '600px',
    slot: 'left-sidebar-ad', // ✅ 修复：使用正确的Slot ID格式
    type: 'skyscraper', // 摩天大楼
    minScreenWidth: BREAKPOINTS.large, // 1400px以上显示
  },
  right: {
    width: '300px', 
    height: '250px',
    slot: 'right-sidebar-ad', 
    type: 'rectangle', // 中矩形，转化率更高
    minScreenWidth: BREAKPOINTS.desktop, // 1200px以上显示
  }
} as const;

interface AdUnit {
  id: string;
  element: Element | null;
  loaded: boolean;
  height: number;
}

const SidebarAds = memo(function SidebarAds() {
  const [screenWidth, setScreenWidth] = useState(0);
  const [showLeftAd, setShowLeftAd] = useState(false);
  const [showRightAd, setShowRightAd] = useState(false);
  const [adUnits, setAdUnits] = useState<Record<string, AdUnit>>({});
  const [debugInfo, setDebugInfo] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  const adsInitialized = useRef(false);
  const loadTimer = useRef<NodeJS.Timeout>();

  // 防抖的屏幕尺寸检测
  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    setScreenWidth(width);
    
    // 基于行业标准的显示逻辑
    const shouldShowLeft = width >= AD_CONFIG.left.minScreenWidth;
    const shouldShowRight = width >= AD_CONFIG.right.minScreenWidth;
    
    setShowLeftAd(shouldShowLeft);
    setShowRightAd(shouldShowRight);
    
    // 更新调试信息
    const deviceType = width >= BREAKPOINTS.xlarge ? 'XL Desktop' :
                      width >= BREAKPOINTS.large ? 'Large Desktop' :
                      width >= BREAKPOINTS.desktop ? 'Desktop' :
                      width >= BREAKPOINTS.tablet ? 'Tablet' : 'Mobile';
    
    setDebugInfo(`${deviceType} (${width}px) | 左侧:${shouldShowLeft ? '✓' : '✗'} | 右侧:${shouldShowRight ? '✓' : '✗'}`);
  }, []);

  // 页面加载完成检测
  useEffect(() => {
    const handlePageLoad = () => {
      // 延迟500ms再加载广告，避免影响页面性能
      setTimeout(() => {
        setIsPageLoaded(true);
      }, 500);
    };

    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
      return () => window.removeEventListener('load', handlePageLoad);
    }
  }, []);

  // 响应式监听
  useEffect(() => {
    checkScreenSize();
    
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150); // 防抖150ms
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [checkScreenSize]);

  // 广告加载逻辑
  const loadAd = useCallback((adId: string, element: Element) => {
    if (!element || adUnits[adId]?.loaded) return;

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        // 初始化广告
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        
        // 更新广告单元状态
        setAdUnits(prev => ({
          ...prev,
          [adId]: {
            id: adId,
            element,
            loaded: true,
            height: 0
          }
        }));

                 // 3秒后检查加载结果
         setTimeout(() => {
           const height = element.clientHeight;
           setAdUnits(prev => ({
             ...prev,
             [adId]: {
               ...prev[adId],
               id: adId,
               element,
               loaded: true,
               height
             }
           }));
           
           setDebugInfo(prev => 
             prev + ` | ${adId}:${height > 0 ? `✓${height}px` : '✗无内容'}`
           );
         }, 3000);

      } else {
        // AdSense脚本未加载，等待重试
        setTimeout(() => loadAd(adId, element), 1000);
      }
    } catch (error) {
      console.error(`广告加载错误 [${adId}]:`, error);
      setDebugInfo(prev => prev + ` | ${adId}:❌错误`);
    }
  }, [adUnits]);

  // 主加载逻辑
  useEffect(() => {
    if (!isPageLoaded || adsInitialized.current) return;
    if (!showLeftAd && !showRightAd) return;

    const initializeAds = () => {
      try {
        setDebugInfo(prev => prev + ' | 开始初始化广告...');
        
        // 左侧广告
        if (showLeftAd) {
          const leftElement = document.querySelector('.sidebar-left-ad .adsbygoogle');
          if (leftElement && !leftElement.hasChildNodes()) {
            loadAd('left', leftElement);
          }
        }

        // 右侧广告  
        if (showRightAd) {
          const rightElement = document.querySelector('.sidebar-right-ad .adsbygoogle');
          if (rightElement && !rightElement.hasChildNodes()) {
            loadAd('right', rightElement);
          }
        }

        adsInitialized.current = true;
        
      } catch (error) {
        console.error('广告初始化错误:', error);
        setDebugInfo(prev => prev + ' | ❌初始化失败');
      }
    };

    // 延迟初始化，确保不影响主要内容加载
    clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(initializeAds, 800);

    return () => {
      if (loadTimer.current) {
        clearTimeout(loadTimer.current);
      }
    };
  }, [isPageLoaded, showLeftAd, showRightAd, loadAd]);

  // 组件卸载清理
  useEffect(() => {
    return () => {
      adsInitialized.current = false;
      if (loadTimer.current) {
        clearTimeout(loadTimer.current);
      }
    };
  }, []);

  // 计算安全的定位位置
  const getSafePosition = useCallback((side: 'left' | 'right') => {
    const contentWidth = 800; // 主内容区域宽度
    const margin = 20; // 安全边距
    const adWidth = side === 'left' ? 160 : 300;
    
    // 确保广告不会覆盖主内容
    const minDistanceFromCenter = (contentWidth / 2) + margin + adWidth;
    const availableSpace = (screenWidth - contentWidth) / 2;
    
    if (availableSpace < adWidth + margin) {
      return null; // 空间不足，不显示
    }
    
    return side === 'left' 
      ? `${margin}px`
      : `${margin}px`;
  }, [screenWidth]);

  const leftPosition = getSafePosition('left');
  const rightPosition = getSafePosition('right');

  return (
    <>
      {/* 左侧摩天大楼广告 - 1400px以上显示 */}
      {showLeftAd && leftPosition && (
        <div 
          className="sidebar-left-ad fixed top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300 ease-in-out"
          style={{ 
            left: leftPosition,
            opacity: adUnits.left?.loaded ? 1 : 0
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <ins 
              className="adsbygoogle"
              style={{ 
                display: 'block',
                width: AD_CONFIG.left.width,
                height: AD_CONFIG.left.height,
                backgroundColor: 'transparent'
              }}
              data-ad-client="ca-pub-1939625526338391"
              data-ad-slot={AD_CONFIG.left.slot}
              data-ad-format="auto"
              data-full-width-responsive="false"
            />
          </div>
          
          {/* 调试信息 */}
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 w-48 max-h-32 overflow-y-auto">
              <strong>左侧广告:</strong><br />
              摩天大楼 160×600
            </div>
          )}
        </div>
      )}

      {/* 右侧矩形广告 - 1200px以上显示 */}
      {showRightAd && rightPosition && (
        <div 
          className="sidebar-right-ad fixed top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300 ease-in-out"
          style={{ 
            right: rightPosition,
            opacity: adUnits.right?.loaded ? 1 : 0
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <ins 
              className="adsbygoogle"
              style={{ 
                display: 'block',
                width: AD_CONFIG.right.width,
                height: AD_CONFIG.right.height,
                backgroundColor: 'transparent'
              }}
              data-ad-client="ca-pub-1939625526338391"
              data-ad-slot={AD_CONFIG.right.slot}
              data-ad-format="auto"
              data-full-width-responsive="false"
            />
          </div>

          {/* 调试信息 */}
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div className="absolute top-full right-0 mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 w-64 max-h-32 overflow-y-auto">
              <strong>右侧广告:</strong><br />
              中矩形 300×250 (高转化率)
            </div>
          )}
        </div>
      )}

      {/* 全局调试信息 - 仅开发环境 */}
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 max-w-sm z-50">
          <strong>广告调试信息:</strong><br />
          <div className="whitespace-pre-wrap font-mono">{debugInfo}</div>
          <div className="mt-2 text-gray-500">
            • 延迟加载: {isPageLoaded ? '✓' : '等待中...'}<br />
            • 初始化: {adsInitialized.current ? '✓' : '待启动'}
          </div>
        </div>
      )}
    </>
  );
});

export default SidebarAds; 