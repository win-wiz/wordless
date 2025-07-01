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
  const [hasAdContent, setHasAdContent] = useState(false); // 新增：是否有广告内容
  const [debugInfo, setDebugInfo] = useState(''); // 添加调试信息
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const adInitialized = useRef(false); // 添加初始化状态跟踪

  useEffect(() => {
    // 使用 Intersection Observer 检测元素是否进入视口
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible && !adInitialized.current) {
            setIsVisible(true);
            setDebugInfo('广告位进入视口，开始加载...');
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

  // 组件卸载时重置状态
  useEffect(() => {
    return () => {
      adInitialized.current = false;
    };
  }, []);

  const loadAd = () => {
    if (adInitialized.current) {
      setDebugInfo('广告已初始化，跳过重复加载');
      return;
    }

    try {
      // 等待AdSense脚本加载完成
      const checkAndLoadAd = () => {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          setDebugInfo('AdSense脚本已加载，正在初始化广告...');
          const adElement = adRef.current?.querySelector('.adsbygoogle');
          if (adElement) {
            // 检查多种状态确保没有重复初始化
            const hasAdContent = adElement.hasChildNodes();
            const hasDataStatus = (adElement as any).dataset.adsbygoogleStatus;
            const hasDataAdStatus = (adElement as any).dataset.adStatus;
            
            if (!hasAdContent && !hasDataStatus && !hasDataAdStatus) {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
              
              // 标记为已初始化
              adInitialized.current = true;
              
              // 设置默认显示状态
              setShowAd(true);
              setDebugInfo('广告初始化完成，等待内容加载...');
              
              // 检测广告是否成功加载
              setTimeout(() => {
                const adHeight = adElement.clientHeight;
                const hasContent = adHeight > 0;
                
                if (hasContent) {
                  setAdLoaded(true);
                  setHasAdContent(true);
                  setDebugInfo(`广告加载成功 (高度: ${adHeight}px)`);
                } else {
                  setDebugInfo('广告位无内容 - 隐藏广告区域');
                  setHasAdContent(false);
                  setShowAd(false); // 没有内容时隐藏广告
                  setAdLoaded(false);
                }
              }, 3000);
            } else {
              setDebugInfo('广告已经初始化过了');
              adInitialized.current = true;
              
              // 检查现有广告是否有内容
              setTimeout(() => {
                const adHeight = adElement.clientHeight;
                const hasContent = adHeight > 0;
                
                if (hasContent) {
                  setShowAd(true);
                  setAdLoaded(true);
                  setHasAdContent(true);
                  setDebugInfo(prev => prev + ` (高度: ${adHeight}px)`);
                } else {
                  setDebugInfo(prev => prev + ' - 无内容，隐藏广告区域');
                  setHasAdContent(false);
                  setShowAd(false);
                  setAdLoaded(false);
                }
              }, 1000);
            }
          }
        } else {
          setDebugInfo('等待AdSense脚本加载...');
          // 如果AdSense脚本还没加载完成，等待一段时间再尝试
          setTimeout(checkAndLoadAd, 1000);
        }
      };

      setTimeout(checkAndLoadAd, 500);
    } catch (err) {
      console.error('AdSense error:', err);
      setDebugInfo(`AdSense错误: ${err instanceof Error ? err.message : '未知错误'}`);
      // 即使出错也显示占位，避免页面布局问题
      setShowAd(true);
      setAdLoaded(true);
      adInitialized.current = true; // 防止重复尝试
    }
  };

  // 如果广告没有内容或不需要显示，返回 null
  if (!showAd || (isVisible && !hasAdContent && adInitialized.current)) {
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
        
        {/* 调试信息 - 仅在开发环境显示 */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            <strong>AdSense调试:</strong> {debugInfo}
            <br />
            <small>
              • 位置: {position} | 
              • 插槽: {slot} | 
              • 域名: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
            </small>
          </div>
        )}
      </div>
    </div>
  );
});

export default AdBanner; 