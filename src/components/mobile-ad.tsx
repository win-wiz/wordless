import { memo, useEffect, useState, useRef } from 'react';

// 移动端广告配置类型
interface AdConfig {
  width: string;
  height: string;
  slot: string;
  minScreenWidth: number;
  maxScreenWidth: number;
}

// 移动端广告配置
const MOBILE_AD_CONFIG = {
  banner: {
    width: '320px',
    height: '50px',
    slot: 'mobile-banner-ad',
    minScreenWidth: 320,
    maxScreenWidth: 767,
  } as AdConfig,
  leaderboard: {
    width: '728px', 
    height: '90px',
    slot: 'tablet-leaderboard-ad',
    minScreenWidth: 768,
    maxScreenWidth: 1199,
  } as AdConfig
};

interface MobileAdProps {
  position?: 'top' | 'bottom';
  className?: string;
}

const MobileAd = memo(function MobileAd({ 
  position = 'bottom',
  className = '' 
}: MobileAdProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [debugInfo, setDebugInfo] = useState('');
  const adRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);

  // 检测设备类型和广告配置
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      
      if (width <= MOBILE_AD_CONFIG.banner.maxScreenWidth) {
        setAdConfig(MOBILE_AD_CONFIG.banner);
        setIsVisible(true);
        setDebugInfo(`移动端 (${width}px) - 显示横幅广告`);
      } else if (width <= MOBILE_AD_CONFIG.leaderboard.maxScreenWidth) {
        setAdConfig(MOBILE_AD_CONFIG.leaderboard);
        setIsVisible(true);
        setDebugInfo(`平板 (${width}px) - 显示排行榜广告`);
      } else {
        setIsVisible(false);
        setDebugInfo(`桌面端 (${width}px) - 隐藏移动广告`);
      }
    };

    checkDevice();
    
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // 加载广告
  useEffect(() => {
    if (!isVisible || !adConfig || adInitialized.current) return;

    const loadMobileAd = () => {
      try {
        const checkAndLoad = () => {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            const adElement = adRef.current?.querySelector('.adsbygoogle');
            if (adElement && !adElement.hasChildNodes()) {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
              adInitialized.current = true;
              
              setDebugInfo(prev => prev + ' | 广告已初始化');
              
              // 检查加载结果
              setTimeout(() => {
                const height = adElement.clientHeight;
                setDebugInfo(prev => 
                  prev + ` | ${height > 0 ? `✓加载成功(${height}px)` : '✗无内容'}`
                );
              }, 2000);
            }
          } else {
            setTimeout(checkAndLoad, 1000);
          }
        };

        // 延迟加载，避免影响页面性能
        setTimeout(checkAndLoad, 1000);
      } catch (error) {
        console.error('移动端广告加载错误:', error);
        setDebugInfo(prev => prev + ' | ❌加载失败');
      }
    };

    loadMobileAd();
  }, [isVisible, adConfig]);

  // 组件卸载时重置
  useEffect(() => {
    return () => {
      adInitialized.current = false;
    };
  }, []);

  if (!isVisible || !adConfig) {
    return null;
  }

  return (
    <div 
      ref={adRef}
      className={`w-full flex justify-center py-2 ${
        position === 'top' ? 'border-b border-gray-100' : 'border-t border-gray-100'
      } bg-gray-50/50 ${className}`}
    >
      <div className="flex flex-col items-center">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: adConfig.width,
            height: adConfig.height,
            backgroundColor: 'transparent'
          }}
          data-ad-client="ca-pub-1939625526338391"
          data-ad-slot={adConfig.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        
        {/* 调试信息 - 仅开发环境 */}
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="mt-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 max-w-xs text-center">
            <strong>移动广告:</strong> {debugInfo}
          </div>
        )}
      </div>
    </div>
  );
});

export default MobileAd; 