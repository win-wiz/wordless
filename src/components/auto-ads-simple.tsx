import { memo, useEffect, useRef } from 'react';

/**
 * 最简洁的自动广告组件
 * 完全信任Google算法，无任何干预
 */
const AutoAds = memo(function AutoAds() {
  const initRef = useRef(false);

  useEffect(() => {
    // 防止重复初始化
    if (initRef.current) return;

    const initializeAutoAds = () => {
      try {
        // 等待AdSense脚本加载
        const checkReady = () => {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            // 启用自动广告 - 完全默认配置
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
              google_ad_client: "ca-pub-1939625526338391",
              enable_page_level_ads: true
            });
            
            initRef.current = true;
            console.log('🎯 自动广告已启用 - 完全信任Google算法');
          } else {
            // AdSense脚本未就绪，100ms后重试
            setTimeout(checkReady, 100);
          }
        };

        checkReady();
      } catch (error) {
        console.error('自动广告初始化失败:', error);
      }
    };

    // 延迟1秒初始化，避免影响页面加载
    const timer = setTimeout(initializeAutoAds, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 组件卸载时重置状态
  useEffect(() => {
    return () => {
      initRef.current = false;
    };
  }, []);

  // 不渲染任何可见内容，完全交给Google处理
  return null;
});

export default AutoAds; 