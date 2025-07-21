import React, { useMemo } from 'react';

const DifficultyLevels: React.FC = React.memo(() => {
  const difficultyLevels = useMemo(
    () => [
      {
        icon: '🟢',
        title: 'Beginner',
        description: 'Perfect for newcomers to the game',
        details: [
          '2 pairs (4 cards total)',
          '90 seconds initial time',
          '+20 seconds bonus per level',
          'Large card size for easy viewing'
        ]
      },
      {
        icon: '🟡',
        title: 'Intermediate',
        description: 'Step up the challenge with more cards',
        details: [
          '4 pairs (8 cards total)',
          '150 seconds initial time',
          '+30 seconds bonus per level',
          'Medium difficulty progression'
        ]
      },
      {
        icon: '🟠',
        title: 'Advanced',
        description: 'Test your memory with complex layouts',
        details: [
          '8 pairs (16 cards total)',
          '210 seconds initial time',
          '+40 seconds bonus per level',
          'Requires strong memory skills'
        ]
      },
      {
        icon: '🔴',
        title: 'Expert',
        description: 'Ultimate challenge for memory masters',
        details: [
          '10 pairs (20 cards total)',
          '300 seconds initial time',
          '+50 seconds bonus per level',
          'Maximum difficulty and complexity'
        ]
      }
    ],
    []
  );

  const progressionTips = useMemo(
    () => [
      'Start with Beginner to learn the game mechanics',
      'Progress to higher difficulties as you improve',
      'Each difficulty has different bonus time calculations',
      'Higher levels offer more bonus time but require better performance'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          📊 Difficulty Levels & Challenges
        </h2>
        <div className='grid lg:grid-cols-2 gap-8'>
          {difficultyLevels.map(level => (
            <div key={level.title} className='bg-white rounded-xl shadow-lg border border-slate-200 p-8'>
              <div className='text-center mb-6'>
                <div className='text-4xl mb-4'>{level.icon}</div>
                <h3 className='text-2xl font-bold text-slate-800 mb-2'>
                  {level.title}
                </h3>
                <p className='text-slate-600 text-lg'>
                  {level.description}
                </p>
              </div>
              <ul className='space-y-3 text-slate-700'>
                {level.details.map((detail, index) => (
                  <li key={index} className='flex items-center gap-3'>
                    <span className='w-2 h-2 bg-purple-500 rounded-full flex-shrink-0'></span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='mt-16 pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-8 text-center'>
            📈 Difficulty Progression Guide
          </h3>
          <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100'>
            <ul className='space-y-4 text-slate-700 text-lg'>
              {progressionTips.map((tip, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span className='w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

DifficultyLevels.displayName = 'DifficultyLevels';

export default DifficultyLevels;