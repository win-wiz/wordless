'use client';

import { memo, useEffect, useRef } from 'react';

export interface GameFrameProps {
  src: string;
  title: string;
}

const GameIframe: React.FC<GameFrameProps> = memo(({ src, title }) => {
  const iframeRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    console.log('GameIframe mounted');

    // 在组件挂载后立即执行滚动
    const scrollToGame = () => {
      console.log('Attempting to scroll...');
      console.log('hasScrolled:', hasScrolled.current);
      console.log('iframeRef exists:', !!iframeRef.current);

      if (!iframeRef.current || hasScrolled.current) {
        console.log('Scroll cancelled - already scrolled or no ref');
        return;
      }
      
      const header = document.querySelector('header');
      console.log('Header element found:', !!header);

      if (header) {
        const headerHeight = header.getBoundingClientRect().height;
        const iframeTop = iframeRef.current.getBoundingClientRect().top;
        const scrollPosition = window.scrollY + iframeTop - headerHeight;

        console.log('scrollPosition', scrollPosition);
        
        console.log('Scroll calculations:', {
          headerHeight,
          iframeTop,
          currentScrollY: window.scrollY,
          calculatedPosition: scrollPosition
        });

        window.scrollTo({
          top: 64,
          behavior: 'smooth'
        });
        
        console.log('Scroll executed to position:', scrollPosition);
        hasScrolled.current = true;
      }
    };

    // 使用requestAnimationFrame确保DOM完全渲染
    const executeScroll = () => {
      console.log('Scheduling scroll with rAF');
      requestAnimationFrame(() => {
        console.log('RAF callback executing');
        scrollToGame();
      });
    };

    // 等待一小段时间确保iframe加载
    const timer = setTimeout(executeScroll, 500); // 增加延时到500ms

    return () => {
      console.log('Cleanup - clearing timeout');
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={iframeRef} className="w-full h-screen flex items-center justify-center">
      <iframe
        src={src}
        title={title}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="lazy"
        onLoad={() => {
          console.log('Iframe content loaded');
        }}
      />
    </div>
  );
});

GameIframe.displayName = 'GameIframe';

export default GameIframe;
