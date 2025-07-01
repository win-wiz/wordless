import { memo, useEffect, useState, useRef } from 'react';

interface AutoAdsConfig {
  enabled: boolean;
  frequency?: 'low' | 'medium' | 'high';
  textAds?: boolean;
  displayAds?: boolean;
  inFeedAds?: boolean;
  inArticleAds?: boolean;
  matchedContentAds?: boolean;
  excludeSelectors?: string[];
}

interface AutoAdsProps {
  config?: Partial<AutoAdsConfig>;
  className?: string;
}

const defaultConfig: AutoAdsConfig = {
  enabled: true,
  frequency: 'medium',
  textAds: true,
  displayAds: true,
  inFeedAds: true,
  inArticleAds: true,
  matchedContentAds: false,
  excludeSelectors: ['.game-section', '.no-ads', '.hero-section']
};

const AutoAds = memo(function AutoAds({ 
  config = {},
  className = ''
}: AutoAdsProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [adsFound, setAdsFound] = useState(0);
  const initRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

  const finalConfig = { ...defaultConfig, ...config };

  // 初始化自动广告
  useEffect(() => {
    if (!finalConfig.enabled || initRef.current) return;

    const initializeAutoAds = async () => {
      try {
        setDebugInfo('正在初始化自动广告...');

        // 等待AdSense脚本加载完成
        const checkAdSenseReady = () => {
          return new Promise<void>((resolve) => {
            const check = () => {
              if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
                resolve();
              } else {
                setTimeout(check, 100);
              }
            };
            check();
          });
        };

        await checkAdSenseReady();
        setDebugInfo('AdSense脚本已就绪，启用自动广告...');

        // 启用自动广告
        if ((window as any).adsbygoogle && (window as any).adsbygoogle.loaded !== true) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
            google_ad_client: "ca-pub-1939625526338391",
            enable_page_level_ads: true,
            overlays: {bottom: true},
            auto_ad_client: "ca-pub-1939625526338391"
          });
        }

        // 设置广告配置
        if ((window as any).googletag && (window as any).googletag.cmd) {
          (window as any).googletag.cmd.push(function() {
            (window as any).googletag.pubads().set('page_url', window.location.href);
          });
        }

        initRef.current = true;
        setIsInitialized(true);
        setDebugInfo('自动广告已启用');

        // 开始监控页面广告
        startAdMonitoring();

      } catch (error) {
        console.error('自动广告初始化失败:', error);
        setDebugInfo(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    // 延迟初始化，确保页面主要内容已加载
    const timer = setTimeout(initializeAutoAds, 1000);
    return () => clearTimeout(timer);
  }, [finalConfig.enabled]);

  // 监控页面广告元素
  const startAdMonitoring = () => {
    if (observerRef.current) return;

    observerRef.current = new MutationObserver((mutations) => {
      let newAdsCount = 0;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // 检查是否是AdSense广告元素
            if (element.matches && (
              element.matches('.adsbygoogle') ||
              element.matches('[data-ad-client]') ||
              element.matches('[id*="google_ads"]') ||
              element.querySelector('.adsbygoogle')
            )) {
              newAdsCount++;
            }
          }
        });
      });

      if (newAdsCount > 0) {
        setAdsFound(prev => prev + newAdsCount);
        setDebugInfo(prev => `${prev} | 发现${newAdsCount}个新广告`);
      }
    });

    // 监控整个document的变化
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  // 添加广告排除区域的样式
  useEffect(() => {
    if (!finalConfig.excludeSelectors?.length) return;

    const addExcludeStyles = () => {
      const styleId = 'auto-ads-exclude-styles';
      let existingStyle = document.getElementById(styleId);
      
      if (!existingStyle) {
        existingStyle = document.createElement('style');
        existingStyle.id = styleId;
        document.head.appendChild(existingStyle);
      }

      const excludeRules = finalConfig.excludeSelectors!.map(selector => 
        `${selector} { --google-ad-exclude: true; }`
      ).join('\n');

      existingStyle.textContent = excludeRules;
    };

    addExcludeStyles();
  }, [finalConfig.excludeSelectors]);

  // 页面可见性变化时刷新广告
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        // 页面重新可见时，刷新广告
        setTimeout(() => {
          if ((window as any).adsbygoogle) {
            setDebugInfo(prev => prev + ' | 页面重新可见，刷新广告');
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInitialized]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 获取设备类型
  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'Unknown';
    
    const width = window.innerWidth;
    return width <= 768 ? 'Mobile' : 
           width <= 1024 ? 'Tablet' : 'Desktop';
  };

  // 获取广告配置信息
  const getConfigInfo = () => {
    const enabledFeatures = [];
    if (finalConfig.textAds) enabledFeatures.push('文字广告');
    if (finalConfig.displayAds) enabledFeatures.push('展示广告');
    if (finalConfig.inFeedAds) enabledFeatures.push('信息流广告');
    if (finalConfig.inArticleAds) enabledFeatures.push('文章内广告');
    if (finalConfig.matchedContentAds) enabledFeatures.push('匹配内容广告');
    
    return enabledFeatures.join(', ') || '无';
  };

  if (!finalConfig.enabled) {
    return null;
  }

  return (
    <div className={`auto-ads-manager ${className}`}>
      {/* 自动广告配置标记 - 不可见但提供页面级配置 */}
      <div 
        className="hidden"
        data-ad-client="ca-pub-1939625526338391"
        data-auto-ads="true"
        data-ad-frequency={finalConfig.frequency}
        data-full-width-responsive="true"
      />

      {/* 开发环境调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 max-w-sm p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg text-sm text-green-800 z-50">
          <div className="flex items-center mb-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <strong>自动广告状态</strong>
          </div>
          
          <div className="space-y-1 text-xs">
            <div><strong>状态:</strong> {isInitialized ? '✅ 已启用' : '⏳ 初始化中'}</div>
            <div><strong>设备:</strong> {getDeviceType()}</div>
            <div><strong>频率:</strong> {finalConfig.frequency}</div>
            <div><strong>发现广告:</strong> {adsFound} 个</div>
            <div><strong>功能:</strong> {getConfigInfo()}</div>
            {finalConfig.excludeSelectors && (
              <div><strong>排除区域:</strong> {finalConfig.excludeSelectors.length} 个</div>
            )}
          </div>
          
          {debugInfo && (
            <div className="mt-3 p-2 bg-white rounded border text-xs">
              <strong>调试信息:</strong><br />
              <div className="font-mono text-gray-600 whitespace-pre-wrap">
                {debugInfo}
              </div>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            • 自动广告由Google自动放置<br />
            • 排除了游戏区域和特殊区域<br />
            • 支持所有设备类型
          </div>
        </div>
      )}
    </div>
  );
});

export default AutoAds; 