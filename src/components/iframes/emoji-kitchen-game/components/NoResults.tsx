'use client';

import React from 'react';
import { NoResultsProps } from '../types';

const NoResults: React.FC<NoResultsProps> = React.memo(
  ({ searchQuery, onClearSearch }) => {
    return (
      <div className='text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md max-w-4xl mx-auto border border-slate-200/80'>
        <div className='w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-3xl'>🔍</span>
        </div>
        <h3 className='text-xl font-semibold text-slate-800 mb-2'>
          No Matches Found
        </h3>
        <p className='text-slate-700 mb-6'>
          We couldn't find any questions matching "{searchQuery}"
        </p>
        <button
          onClick={onClearSearch}
          className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
        >
          Clear Search
        </button>
      </div>
    );
  }
);

NoResults.displayName = 'NoResults';

export default NoResults;