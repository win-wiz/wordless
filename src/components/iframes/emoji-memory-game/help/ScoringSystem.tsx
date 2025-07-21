import React, { useMemo } from 'react';

const ScoringSystem: React.FC = React.memo(() => {
  const scoringFeatures = useMemo(
    () => [
      {
        icon: '🎯',
        title: 'Move-Based Scoring',
        description:
          'Your score is calculated based on the number of card flips (moves) you make. Fewer moves result in better performance ratings.'
      },
      {
        icon: '⏱️',
        title: 'Time Efficiency',
        description:
          'Faster completion times contribute to better bonus calculations and higher performance ratings for subsequent levels.'
      },
      {
        icon: '📈',
        title: 'Level Progression',
        description:
          'Each completed level increases the number of card pairs, making the game progressively more challenging and rewarding.'
      },
      {
        icon: '🏆',
        title: 'Performance Tracking',
        description:
          'The game tracks your total moves across all levels and provides feedback on your overall performance and improvement.'
      }
    ],
    []
  );

  const bonusSystem = useMemo(
    () => [
      'Bonus time is awarded between levels based on your performance',
      'Better performance in previous levels gives you more bonus time',
      'Each difficulty level has different bonus time calculations',
      'Consistent good performance increases your overall bonus time'
    ],
    []
  );

  const scoringTips = useMemo(
    () => [
      'Try to minimize the number of moves for better scores',
      'Focus on accuracy rather than speed in the beginning',
      'Learn from each level to improve your strategy',
      'Practice regularly to build muscle memory and pattern recognition'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          📈 Scoring & Progress System
        </h2>
        <div className='grid lg:grid-cols-2 gap-16'>
          <div className='space-y-12'>
            {scoringFeatures.slice(0, 2).map(feature => (
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
            {scoringFeatures.slice(2, 4).map(feature => (
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
          <h3 className='text-2xl font-bold text-slate-800 mb-12 text-center'>
            💡 Score Improvement Tips
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                How Bonus Time Works:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {bonusSystem.map((item, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-purple-400 text-xl'>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Scoring Improvement Tips:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {scoringTips.map((tip, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-purple-400 text-xl'>•</span>
                    {tip}
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

ScoringSystem.displayName = 'ScoringSystem';

export default ScoringSystem;