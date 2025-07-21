import React, { useMemo } from 'react';

const WinningStrategies: React.FC = React.memo(() => {
  const basicStrategies = useMemo(
    () => [
      'Start with a systematic approach - flip cards row by row or column by column',
      'Pay close attention to the position of each emoji you reveal',
      'Try to remember unique emojis you\'ve only seen once',
      'When you see an emoji for the second time, immediately try to recall its first location'
    ],
    []
  );

  const advancedTechniques = useMemo(
    () => [
      {
        title: 'Pattern Recognition',
        description: 'Look for visual patterns in emoji placement and use spatial memory to your advantage.',
        tips: [
          'Group similar emojis mentally by their positions',
          'Use the grid layout as a reference system',
          'Notice if certain types of emojis appear in specific areas'
        ]
      },
      {
        title: 'Memory Palace Technique',
        description: 'Create mental associations between emojis and their grid positions.',
        tips: [
          'Associate emojis with memorable stories or connections',
          'Use the grid coordinates as memory anchors',
          'Link adjacent cards together in your memory'
        ]
      },
      {
        title: 'Elimination Strategy',
        description: 'Focus on emojis you\'ve seen multiple times to reduce the search space.',
        tips: [
          'Prioritize finding pairs for emojis you\'ve seen twice',
          'Keep track of which emojis you haven\'t found yet',
          'Use process of elimination for the final pairs'
        ]
      }
    ],
    []
  );

  const mentalTips = useMemo(
    () => [
      'Stay calm and focused - anxiety can hurt memory performance',
      'Take short mental breaks between difficult levels',
      'Practice regularly to build your visual memory skills',
      'Don\'t get frustrated by mistakes - they\'re part of learning'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          🎯 Winning Strategies & Tips
        </h2>
        
        <div className='mb-16'>
          <h3 className='text-2xl font-bold text-slate-800 mb-8 text-center'>
            🎯 Basic Strategy Foundation
          </h3>
          <div className='grid lg:grid-cols-2 gap-8'>
            {basicStrategies.map((strategy, index) => (
              <div key={index} className='flex items-start gap-4 p-6 bg-white rounded-xl shadow-lg border border-slate-200'>
                <div className='w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                  {index + 1}
                </div>
                <p className='text-slate-700 text-lg leading-relaxed'>{strategy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='mb-16'>
          <h3 className='text-2xl font-bold text-slate-800 mb-8 text-center'>
            🔬 Advanced Memory Techniques
          </h3>
          <div className='space-y-12'>
            {advancedTechniques.map((technique, index) => (
              <div key={index} className='bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-8 border border-slate-200'>
                <h4 className='text-xl font-bold text-slate-800 mb-4'>
                  {technique.title}
                </h4>
                <p className='text-slate-700 text-lg mb-6 leading-relaxed'>
                  {technique.description}
                </p>
                <div className='grid md:grid-cols-3 gap-4'>
                  {technique.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className='bg-white p-4 rounded-lg border border-slate-200'>
                      <p className='text-slate-600 text-sm leading-relaxed'>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-16 pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-8 text-center'>
            🧘 Mental Performance Tips
          </h3>
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100'>
            <ul className='grid md:grid-cols-2 gap-6'>
              {mentalTips.map((tip, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span className='w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                    {index + 1}
                  </span>
                  <span className='text-slate-700 text-lg leading-relaxed'>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mt-12 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100'>
          <h4 className='text-xl font-bold text-slate-800 mb-4 text-center'>
            🏆 Master Player Secret
          </h4>
          <p className='text-slate-700 text-lg leading-relaxed text-center'>
            The best players don\'t just rely on memory - they develop systematic approaches
            and stay consistent with their strategies. Practice these techniques regularly,
            and you\'ll see significant improvement in your performance and enjoyment of the game.
          </p>
        </div>
      </div>
    </div>
  );
});

WinningStrategies.displayName = 'WinningStrategies';

export default WinningStrategies;