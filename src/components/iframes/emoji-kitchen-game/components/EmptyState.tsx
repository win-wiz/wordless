'use client';

import React from 'react';
import { EmptyStateProps } from '../types';

const EmptyState: React.FC<EmptyStateProps> = React.memo(({ onViewAll }) => {
  return (
    <div className='text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md max-w-4xl mx-auto border border-slate-200/80'>
      <div className='w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6'>
        <span className='text-4xl'>🤔</span>
      </div>
      <h3 className='text-xl font-semibold text-slate-800 mb-2'>
        No Questions Found
      </h3>
      <p className='text-slate-700 mb-6'>
        Select different categories or view all questions
      </p>
      <button
        onClick={onViewAll}
        className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
      >
        View All Questions
      </button>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;