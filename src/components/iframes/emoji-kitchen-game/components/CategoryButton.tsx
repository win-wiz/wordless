'use client';

import React, { useMemo, useCallback } from 'react';
import { CategoryButtonProps } from '../types';

// 获取类别配置的纯函数
export const getCategoryConfig = (category: string) => {
  switch (category) {
    case 'all':
      return { label: 'All Questions', icon: '📋' };
    case 'general':
      return { label: 'General', icon: '🎯' };
    case 'usage':
      return { label: 'How to Use', icon: '🎮' };
    case 'technical':
      return { label: 'Technical', icon: '⚙️' };
    case 'sharing':
      return { label: 'Sharing', icon: '📤' };
    case 'privacy':
      return { label: 'Privacy', icon: '🔒' };
    default:
      return { label: 'Unknown', icon: '❓' };
  }
};

const CategoryButton: React.FC<CategoryButtonProps> = React.memo(
  ({ category, isActive, count, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(category);
    }, [category, onClick]);

    const categoryConfig = useMemo(() => getCategoryConfig(category), [category]);

    return (
      <button
        onClick={handleClick}
        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2.5 ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50 border border-blue-500'
            : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-md border border-slate-200/60'
        }`}
      >
        <span className='text-lg'>{categoryConfig.icon}</span>
        <span>{categoryConfig.label}</span>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full ${
            isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
          }`}
        >
          {count}
        </span>
      </button>
    );
  }
);

CategoryButton.displayName = 'CategoryButton';

export default CategoryButton;