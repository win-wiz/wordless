'use client';

import React from 'react';
import { TipItem } from '../data';

interface TipCardProps {
  tip: TipItem;
}

const TipCard: React.FC<TipCardProps> = ({ tip }) => {
  return (
    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300'>
      <div className='flex items-start gap-3'>
        <span className='text-2xl'>{tip.icon}</span>
        <div>
          <h4 className='font-semibold text-slate-800 mb-1'>{tip.title}</h4>
          <p className='text-sm text-slate-600 leading-relaxed'>{tip.content}</p>
        </div>
      </div>
    </div>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(TipCard);