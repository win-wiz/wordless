import React from 'react';

const HelpCenterHeader: React.FC = React.memo(() => {
  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto text-center'>
        <p className='mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-slate-500'>
          Daily Puzzle + Unlimited Mode
        </p>
        <h1
          id='help-center-title'
          className='mb-8 text-5xl font-bold text-slate-800 sm:text-6xl'
        >
          Play Waffle Game Online
        </h1>
        <div className='w-40 h-1 bg-gradient-to-r from-blue-500 to-slate-600 mx-auto mb-8'></div>
        <p className='text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed'>
          Swap letters, solve 6 connected words, and finish the board in 15
          moves.
        </p>
        <p className='mt-6 max-w-3xl mx-auto text-lg leading-relaxed text-slate-600'>
          Start with today&apos;s Waffle if you want one fresh challenge a day,
          or jump into unlimited mode when you just want to keep playing right
          in your browser.
        </p>
      </div>
    </div>
  );
});

HelpCenterHeader.displayName = 'HelpCenterHeader';

export default HelpCenterHeader;
