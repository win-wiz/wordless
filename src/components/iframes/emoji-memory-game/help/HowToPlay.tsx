import React, { useMemo } from 'react';

const HowToPlay: React.FC = React.memo(() => {
  const gameSteps = useMemo(
    () => [
      {
        number: 1,
        title: 'Choose Your Difficulty',
        description:
          'Select from Beginner (4 cards), Intermediate (8 cards), Advanced (16 cards), or Expert (20 cards) to match your skill level and available time.'
      },
      {
        number: 2,
        title: 'Start Flipping Cards',
        description:
          'Click on any card to reveal the emoji underneath and start the timer. Remember the position and emoji you see as you flip cards one by one.'
      },
      {
        number: 3,
        title: 'Find Matching Pairs',
        description:
          'Try to find two cards with identical emojis. When you find a match, both cards stay revealed. Continue until all pairs are matched to win the level.'
      }
    ],
    []
  );

  const gameplayTips = useMemo(
    () => [
      'You can only flip two cards at a time',
      'Mismatched cards will flip back after a short delay',
      'The timer starts when you flip your first card',
      'Try to remember positions of emojis you\'ve seen'
    ],
    []
  );

  const strategyTips = useMemo(
    () => [
      'Start with a systematic approach (row by row or column by column)',
      'Focus on remembering unique emojis you\'ve only seen once',
      'When you see an emoji for the second time, try to recall where you saw it first',
      'Stay calm and don\'t rush - accuracy is more important than speed'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          📖 How to Play Emoji Memory Game
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
            💡 Essential Gameplay Tips
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-4'>
                Basic Rules:
              </h4>
              <ul className='space-y-3 text-slate-600 text-lg'>
                {gameplayTips.map((tip, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='w-6 h-6 bg-purple-100 text-slate-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border border-purple-200'>
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-4'>
                Winning Strategies:
              </h4>
              <ul className='space-y-3 text-slate-600 text-lg'>
                {strategyTips.map((strategy, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-slate-400 text-xl'>•</span>
                    {strategy}
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