'use client';

import React from 'react';
import { FaqItem } from '../data';

interface FaqCardProps {
  faq: FaqItem;
}

const FaqCard: React.FC<FaqCardProps> = ({ faq }) => {
  return (
    <div className='bg-white rounded-xl p-6 shadow-lg border border-slate-200/50'>
      <h3 className='font-bold text-slate-800 mb-3'>{faq.question}</h3>
      <p className='text-slate-600 text-sm'>{faq.answer}</p>
    </div>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(FaqCard);