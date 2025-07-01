'use client';

import { useEffect } from 'react';

// 扩展 Window 接口
declare global {
  interface Window {
    adsbygoogle: any[];
    adsbygoogle_page_level_initialized?: boolean;
  }
}

export default function AdSenseInitializer() {
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') return;

    // 多重防重复检查
    const initializeAdSense = () => {
      try {
        // 检查全局标记
        if (window.adsbygoogle_page_level_initialized) {
          console.log('AdSense 页面级广告已经初始化过，跳过');
          return;
        }

        // 检查 adsbygoogle 是否存在
        const adsbygoogle = window.adsbygoogle;
        if (!adsbygoogle) {
          console.log('AdSense 脚本未加载，延迟初始化');
          setTimeout(initializeAdSense, 100);
          return;
        }

        // 检查数组中是否已有页面级广告配置
        const hasPageLevelAds = adsbygoogle.some((item: any) => 
          item && typeof item === 'object' && item.enable_page_level_ads
        );

        if (hasPageLevelAds) {
          console.log('AdSense 页面级广告已存在，跳过初始化');
          return;
        }

        // 设置全局标记
        window.adsbygoogle_page_level_initialized = true;

        // 初始化页面级广告
        adsbygoogle.push({
          google_ad_client: "ca-pub-1939625526338391",
          enable_page_level_ads: true
        });

        console.log('AdSense 页面级广告已成功初始化');
      } catch (error) {
        console.error('AdSense 初始化错误:', error);
      }
    };

    // 延迟执行，确保 AdSense 脚本已加载
    const timer = setTimeout(initializeAdSense, 500);

    // 清理函数
    return () => {
      clearTimeout(timer);
    };
  }, []); // 空依赖数组，确保只执行一次

  return null; // 不渲染任何内容
} 