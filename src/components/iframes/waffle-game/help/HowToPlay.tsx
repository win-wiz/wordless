import React from 'react';

const GAME_STEPS = [
  {
    number: 1,
    title: 'Read the Board First',
    description:
      'Start by scanning the 5x5 grid. Green letters are already in the right spot, yellow letters belong in the word but need to move, and gray letters are still in the wrong place.'
  },
  {
    number: 2,
    title: 'Focus on the Intersections',
    description:
      'Shared letters matter the most. A smart swap at an intersection can help both an across word and a down word at the same time.'
  },
  {
    number: 3,
    title: 'Use Your Swaps Carefully',
    description:
      'You only get 15 swaps, so every move should help the board make more sense. Try to avoid random swaps once you have a few strong clues.'
  }
] as const;

const PRIORITY_STEPS = [
  'Leave the green letters where they are.',
  'Use the intersections to narrow down your next move.',
  'Move yellow letters into better spots before worrying about the whole board.',
  'Clean up the last few gray letters once the pattern is clear.'
] as const;

const COMMON_MISTAKES = [
  'Moving a green letter that is already locked in.',
  'Ignoring an intersection and solving one word in isolation.',
  'Burning swaps on guesses that do not improve the board.',
  'Looking at one row at a time instead of the full grid.'
] as const;

const HowToPlay: React.FC = React.memo(() => {

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          How to Play
        </h2>
        <div className='grid lg:grid-cols-3 gap-12'>
          {GAME_STEPS.map(step => (
            <div key={step.number} className='text-center space-y-6'>
              <div className='w-20 h-20 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-lg border border-slate-200'>
                {step.number}
              </div>
              <h3 className='text-2xl font-bold text-slate-800 mb-4'>
                {step.title}
              </h3>
              <p className='text-slate-600 text-lg leading-relaxed'>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className='mt-12 pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-8 text-center'>
            A Simple Way to Approach It
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-4'>
                What to Prioritize
              </h4>
              <ol className='space-y-3 text-slate-600 text-lg'>
                {PRIORITY_STEPS.map((step, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='w-6 h-6 bg-blue-100 text-slate-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border border-blue-200'>
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-4'>
                Common Mistakes
              </h4>
              <ul className='space-y-3 text-slate-600 text-lg'>
                {COMMON_MISTAKES.map((mistake, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-slate-400 text-xl'>•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HowToPlay.displayName = 'HowToPlay';

export default HowToPlay;
