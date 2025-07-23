'use client';

import React from 'react';

interface SectionHeaderProps {
  icon: string;
  title: string;
  description: string;
  iconBgColor: string;
  iconRotation?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  icon, 
  title, 
  description, 
  iconBgColor,
  iconRotation = 'rotate-12'
}) => {
  return (
    <div className='text-center mb-12'>
      <h2 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-4'>
        <span className={`w-12 h-12 bg-gradient-to-br ${iconBgColor} rounded-2xl inline-flex items-center justify-center text-white mr-4 shadow-lg transform ${iconRotation} animate-pulse`}>
          {icon}
        </span>
        {title}
      </h2>
      <p className='text-lg text-slate-600 max-w-3xl mx-auto'>
        {description}
      </p>
    </div>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(SectionHeader);