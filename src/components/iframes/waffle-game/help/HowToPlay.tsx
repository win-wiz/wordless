import React, { useMemo } from 'react';

const HowToPlay: React.FC = React.memo(() => {
  const gameSteps = useMemo(
    () => [
      {
        number: 1,
        title: 'Analyze the Waffle Game Grid',
        description:
          "Begin your Waffle Game by examining the 5×5 grid. Notice the color-coded feedback: green tiles are in correct positions, yellow tiles need moving, and gray tiles don't belong in their current words."
      },
      {
        number: 2,
        title: 'Master Intersections',
        description:
          "Focus on Waffle Game's unique intersection points marked with blue halos. These crucial positions require letters that work perfectly for both horizontal and vertical words."
      },
      {
        number: 3,
        title: 'Strategic Letter Swaps',
        description:
          'Make your moves count in Waffle Game! Select two letters to swap positions, keeping in mind your 15-move limit. Each swap should bring you closer to completing all six words.'
      }
    ],
    []
  );

  const prioritySteps = useMemo(
    () => [
      "Begin with green letters - they're already in perfect positions in Waffle Game",
      'Focus on yellow letters at Waffle Game intersections for maximum impact',
      'Strategically relocate remaining yellow letters to their correct spots',
      'Finally, address gray letters to complete your Waffle Game puzzle'
    ],
    []
  );

  const commonMistakes = useMemo(
    () => [
      "Never move green letters in Waffle Game - they're already correct",
      "Don't ignore intersection requirements in Waffle Game puzzles",
      'Avoid wasting moves on obviously incorrect positions',
      'Remember to consider all words simultaneously in Waffle Game'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          🎯 How to Play Waffle Game
        </h2>
        <div className='grid lg:grid-cols-3 gap-12'>
          {gameSteps.map(step => (
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
            ⚡ Essential Waffle Game Strategy Guide
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-4'>
                Solving Priority in Waffle Game:
              </h4>
              <ol className='space-y-3 text-slate-600 text-lg'>
                {prioritySteps.map((step, index) => (
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
                Common Waffle Game Mistakes to Avoid:
              </h4>
              <ul className='space-y-3 text-slate-600 text-lg'>
                {commonMistakes.map((mistake, index) => (
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
