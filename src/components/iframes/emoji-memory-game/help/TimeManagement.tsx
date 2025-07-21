import React, { useMemo } from 'react';

const TimeManagement: React.FC = React.memo(() => {
  const timeFeatures = useMemo(
    () => [
      {
        icon: '⏰',
        title: 'Initial Time Limits',
        description:
          'Each difficulty level starts with different time allocations: Beginner (90s), Intermediate (150s), Advanced (210s), Expert (300s).'
      },
      {
        icon: '🎁',
        title: 'Bonus Time Rewards',
        description:
          'Complete levels efficiently to earn bonus time for subsequent levels. Better performance means more extra time to work with.'
      },
      {
        icon: '📊',
        title: 'Performance Calculation',
        description:
          'Bonus time is calculated based on your recent performance, including completion speed and move efficiency across multiple levels.'
      },
      {
        icon: '⏸️',
        title: 'Timer Behavior',
        description:
          'The timer starts when you flip your first card and pauses during level transitions, giving you time to prepare for the next challenge.'
      }
    ],
    []
  );

  const timeStrategies = useMemo(
    () => [
      'Don\'t rush - accuracy is more important than speed',
      'Take a moment to scan the board before making your first move',
      'The timer pauses between levels, so use that time to rest',
      'Focus on building consistent performance rather than rushing'
    ],
    []
  );

  const bonusCalculation = useMemo(
    () => [
      'Beginner: +20 seconds bonus per level completed',
      'Intermediate: +30 seconds bonus per level completed',
      'Advanced: +40 seconds bonus per level completed',
      'Expert: +50 seconds bonus per level completed'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          ⏱️ Time Management Guide
        </h2>
        <div className='grid lg:grid-cols-2 gap-16'>
          <div className='space-y-12'>
            {timeFeatures.slice(0, 2).map(feature => (
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
            {timeFeatures.slice(2, 4).map(feature => (
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

        <div className='mt-16 pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-8 text-center'>
            💡 Time Management Strategies
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Bonus Time by Difficulty:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {bonusCalculation.map((bonus, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      {index + 1}
                    </span>
                    {bonus}
                  </li>
                ))}
              </ul>
            </div>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Time Management Tips:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {timeStrategies.map((strategy, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-slate-400 text-xl'>•</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className='mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100'>
          <h4 className='text-xl font-bold text-slate-800 mb-4 text-center'>
            💡 Pro Time Management Tip
          </h4>
          <p className='text-slate-700 text-lg leading-relaxed text-center'>
            Remember that consistent good performance across multiple levels is more
            valuable than rushing through individual levels. The bonus time system
            rewards steady improvement and efficient play patterns.
          </p>
        </div>
      </div>
    </div>
  );
});

TimeManagement.displayName = 'TimeManagement';

export default TimeManagement;