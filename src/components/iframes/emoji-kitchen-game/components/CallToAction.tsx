'use client';

import React, { useCallback } from 'react';

interface CallToActionProps {
  onClick: () => void;
  text: string;
  icon: string;
}

const CallToAction: React.FC<CallToActionProps> = ({ onClick, text, icon }) => {
  // 使用useCallback优化事件处理函数
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <button 
      onClick={handleClick}
      className='inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-500 cursor-pointer group relative overflow-hidden'
    >
      {/* 背景动效 */}
      <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
      <span className='relative z-10 text-lg font-semibold group-hover:text-white transition-colors duration-300'>{text}</span>
      <span className='relative z-10 text-2xl animate-bounce group-hover:animate-pulse transition-all duration-300'>{icon}</span>
    </button>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(CallToAction);