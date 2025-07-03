import React, { useMemo } from 'react';

const GameIntroduction: React.FC = React.memo(() => {
  const gameFeatures = useMemo(
    () => [
      'Create 3 horizontal + 3 vertical words in Waffle Game',
      'Strategic letter placement at intersections',
      'Solve puzzles with just 15 smart swaps',
      'Color-coded feedback guides your moves'
    ],
    []
  );

  const targetAudience = useMemo(
    () => [
      'Word puzzle enthusiasts seeking a fresh challenge',
      'Strategic thinkers who love language games',
      'English vocabulary builders and learners',
      'Players who enjoy daily brain training'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-12 text-center'>
          🎮 What is Waffle Game?
        </h2>
        <div className='grid lg:grid-cols-2 gap-16'>
          <div className='space-y-8'>
            <p className='text-slate-700 text-xl leading-relaxed'>
              Waffle Game is an innovative word puzzle that combines the best
              elements of crosswords and word-swapping games. In each Waffle
              Game puzzle, you'll discover a unique 5×5 grid where your goal is
              to create six perfect five-letter words through strategic letter
              swaps.
            </p>
            <div className='space-y-6'>
              <h4 className='text-2xl font-bold text-slate-800 mb-4'>
                Unique Waffle Game Features:
              </h4>
              <ul className='space-y-4 text-slate-700 text-lg'>
                {gameFeatures.map((feature, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-blue-500 text-2xl'>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='space-y-8'>
            <div className='space-y-6'>
              <h4 className='text-2xl font-bold text-slate-800 mb-4'>
                Who Will Love Waffle Game?
              </h4>
              <div className='space-y-4 text-slate-700 text-lg'>
                {targetAudience.map((audience, index) => (
                  <p key={index} className='flex items-center gap-3'>
                    <span className='text-blue-600 text-xl'>✅</span>
                    {audience}
                  </p>
                ))}
              </div>
            </div>
            <div className='mt-8 pt-8 border-t border-slate-200'>
              <h4 className='text-xl font-bold text-slate-800 mb-4'>
                💡 Getting Started with Waffle Game
              </h4>
              <p className='text-slate-700 text-lg leading-relaxed'>
                New to Waffle Game? Don't worry! The color-coded feedback system
                makes it easy to learn and enjoy. Start with understanding the
                basics: green tiles are correct, yellow need moving, and gray
                need replacing. With each puzzle you solve, you'll discover new
                Waffle Game strategies and improve your word skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

GameIntroduction.displayName = 'GameIntroduction';

export default GameIntroduction;
