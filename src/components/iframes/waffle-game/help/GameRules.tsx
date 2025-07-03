import React, { useMemo } from 'react';

const GameRules: React.FC = React.memo(() => {
  const gameFeatures = useMemo(
    () => [
      {
        icon: '🎯',
        title: 'Waffle Game Objective',
        description:
          'Create 6 valid English words by strategically arranging letters in the Waffle Game grid'
      },
      {
        icon: '🔄',
        title: 'Move Limit in Waffle Game',
        description:
          'Complete each Waffle Game puzzle within 15 strategic letter swaps'
      },
      {
        icon: '🖱️',
        title: 'How to Play Waffle Game',
        description:
          'Select and swap two letters to progress - each swap counts toward your 15-move limit'
      },
      {
        icon: '🏆',
        title: 'Winning Waffle Game',
        description:
          'Victory is achieved when all 6 words are correctly formed and turn green'
      }
    ],
    []
  );

  const wordRequirements = useMemo(
    () => [
      'All Waffle Game words must be valid English words',
      'Proper nouns are not allowed in Waffle Game',
      'No abbreviations or slang terms accepted',
      'Each word in Waffle Game must contain exactly 5 letters'
    ],
    []
  );

  const swapRules = useMemo(
    () => [
      'Swap two letters at a time in Waffle Game',
      'Color feedback updates instantly after each swap',
      'Swaps cannot be undone - choose wisely',
      'Game ends when all 15 moves are used or puzzle is solved'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          📋 Official Waffle Game Rules
        </h2>
        <div className='grid lg:grid-cols-2 gap-16'>
          <div className='space-y-12'>
            {gameFeatures.slice(0, 2).map(feature => (
              <div key={feature.title} className='text-center'>
                <div className='w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-lg border border-slate-200'>
                  {feature.icon}
                </div>
                <h3 className='text-2xl font-bold text-slate-800 mb-4'>
                  {feature.title}
                </h3>
                <p className='text-slate-600 text-lg leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          <div className='space-y-12'>
            {gameFeatures.slice(2, 4).map(feature => (
              <div key={feature.title} className='text-center'>
                <div className='w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-lg border border-slate-200'>
                  {feature.icon}
                </div>
                <h3 className='text-2xl font-bold text-slate-800 mb-4'>
                  {feature.title}
                </h3>
                <p className='text-slate-600 text-lg leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-12 pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-12 text-center'>
            📝 Complete Waffle Game Rules Guide
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Word Requirements in Waffle Game:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {wordRequirements.map((requirement, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-blue-400 text-xl'>•</span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Waffle Game Swap Rules:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {swapRules.map((rule, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-blue-400 text-xl'>•</span>
                    {rule}
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

GameRules.displayName = 'GameRules';

export default GameRules;
