'use client';

import React from 'react';

const Footer: React.FC = React.memo(() => {
  return (
    <div className='mt-16'>
      <div className='text-center'>
        <div className='bg-gradient-to-r from-slate-100/80 to-blue-100/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-300/60 shadow-md max-w-4xl mx-auto'>
          <p className='text-slate-700 font-medium'>
            💫 Need more help with the Emoji Kitchen Game? Try our random emoji generator feature in the Emoji Kitchen Game, or explore our comprehensive Emoji Kitchen Game help center for more creative mixing tips!
          </p>
        </div>
      </div>
    </div>
  );
});

Footer.displayName = 'Footer';

export default Footer;