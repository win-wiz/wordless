'use client';

import React, { useCallback } from 'react';

interface NavigationButtonProps {
  onClick: () => void;
  bgColor: string;
  hoverBgColor: string;
  children: React.ReactNode;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ 
  onClick, 
  bgColor, 
  hoverBgColor, 
  children 
}) => {
  // 使用useCallback优化事件处理函数
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <button 
      onClick={handleClick}
      className={`px-6 py-3 ${bgColor} text-white rounded-lg ${hoverBgColor} hover:scale-105 active:scale-95 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform`}
    >
      {children}
    </button>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(NavigationButton);