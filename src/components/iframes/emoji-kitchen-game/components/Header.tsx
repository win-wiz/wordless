'use client';

import React from 'react';

const Header: React.FC = React.memo(() => {
  return (
    <div className='text-center mb-16 max-w-4xl mx-auto'>
      <div className='inline-flex items-center justify-center w-20 h-20 bg-slate-200/80 backdrop-blur-sm rounded-2xl mb-6 shadow-lg border border-slate-300'>
        <span className='text-3xl'>❓</span>
      </div>
      <h2 className='text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-4'>
        Complete Emoji Kitchen Game FAQ Guide
      </h2>
      <div className='w-24 h-1 bg-gradient-to-r from-blue-500 to-slate-600 mx-auto mb-6'></div>
      <p className='text-lg text-slate-700/90 max-w-2xl mx-auto'>
        Find comprehensive answers to all your Emoji Kitchen Game questions - from basic emoji mixing techniques to advanced Emoji Kitchen Game features and creative combination strategies
      </p>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;