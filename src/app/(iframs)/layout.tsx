'use client';

import { useEffect } from 'react';

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 确保在主页面执行滚动
    const timer = setTimeout(() => {
      const header = document.querySelector('header');
      const gameFrame = document.querySelector('[data-game-frame]');
      
      if (header && gameFrame) {
        const headerRect = header.getBoundingClientRect();
        const gameRect = gameFrame.getBoundingClientRect();
        const scrollPosition = gameRect.top + window.scrollY - headerRect.height;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 300); // 增加延时以确保组件完全加载

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
} 