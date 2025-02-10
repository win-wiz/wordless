"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpToLine } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"

// 优化防抖函数，使用useMemo缓存防抖函数实例
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedCallback = useMemo(
    () => {
      const func = (...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      };
      return func as T;
    },
    [callback, delay]
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// 使用memo优化按钮组件，并缓存className计算
const ScrollToTopButton = memo(function ScrollToTopButton({ 
  showTopBtn, 
  onClick 
}: { 
  showTopBtn: boolean; 
  onClick: () => void;
}) {
  const buttonClassName = useMemo(() => {
    return cn(
      "fixed bottom-8 rounded-full right-8 z-50 bg-violet-500 hover:bg-violet-600 shadow-lg transition-all duration-300 ease-in-out",
      "hover:scale-110",
      showTopBtn
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-4 pointer-events-none cursor-default"
    );
  }, [showTopBtn]);

  return (
    <Button
      onClick={onClick}
      className={buttonClassName}
      size="icon"
    >
      <ArrowUpToLine className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
});

export function ScrollToTop() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const scrollThreshold = useRef(0);
  const resizeObserverRef = useRef<ResizeObserver>();

  // 使用 useMemo 缓存阈值计算函数
  const updateThreshold = useMemo(
    () => () => {
      scrollThreshold.current = window.innerHeight / 2;
    },
    []
  );

  // 使用 useCallback 优化滚动处理函数
  const handleScroll = useCallback(() => {
    setShowTopBtn(window.scrollY > scrollThreshold.current);
  }, []);

  // 使用防抖优化滚动事件处理
  const debouncedHandleScroll = useDebounce(handleScroll, 100);

  // 使用 useCallback 优化点击处理函数
  const scrollToTop = useCallback(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  // 初始化阈值和设置ResizeObserver
  useEffect(() => {
    updateThreshold();

    // 创建 ResizeObserver 实例
    resizeObserverRef.current = new ResizeObserver(updateThreshold);
    resizeObserverRef.current.observe(document.body);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [updateThreshold]);

  // 单独处理滚动事件监听
  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, [debouncedHandleScroll]);

  return <ScrollToTopButton showTopBtn={showTopBtn} onClick={scrollToTop} />;
}
