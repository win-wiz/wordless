import React from 'react';

const HelpCenterHeader: React.FC = React.memo(() => {
  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto text-center'>
        <h1 className='text-6xl font-bold text-slate-800 mb-8'>
          🎮 Waffle Game Help Center
        </h1>
        <div className='w-40 h-1 bg-gradient-to-r from-blue-500 to-slate-600 mx-auto mb-8'></div>
        <p className='text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed'>
          Welcome to the official Waffle Game guide! Master this unique word
          puzzle game where you swap letters strategically to create 6 perfect
          words in a 5×5 grid. Learn everything about Waffle Game, from basic
          rules to advanced strategies.
        </p>
      </div>
    </div>
  );
});

HelpCenterHeader.displayName = 'HelpCenterHeader';

export default HelpCenterHeader;
