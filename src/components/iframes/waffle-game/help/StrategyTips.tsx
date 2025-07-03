import React from 'react';

// Static content extracted for performance optimization
const BASIC_STRATEGIES = [
  'Master Waffle Game intersections for efficient solving',
  'Keep green letters fixed in Waffle Game puzzles',
  'Strategically reposition yellow letters in Waffle Game',
  'Begin with high-confidence words in Waffle Game'
] as const;

const ADVANCED_TIPS = [
  'Learn common English patterns for faster Waffle Game solving',
  'Consider letter frequency in Waffle Game words',
  'Analyze the entire Waffle Game grid layout holistically',
  'Build a mental library of common five-letter words'
] as const;

const STEP_CONTENT = [
  {
    title: 'Step 1: Waffle Game Analysis',
    items: [
      'Locate all green letters in the Waffle Game grid',
      'Map potential positions for yellow letters',
      'Identify intersection requirements',
      'Spot familiar word patterns in Waffle Game'
    ]
  },
  {
    title: 'Step 2: Waffle Game Strategy',
    items: [
      'Focus on solving intersection points first',
      'Begin with most confident word combinations',
      'Consider multiple word relationships',
      'Plan moves to stay within the 15-swap limit'
    ]
  },
  {
    title: 'Step 3: Execute Waffle Game Moves',
    items: [
      'Make deliberate, thoughtful letter swaps',
      'Evaluate board state after each move',
      'Maintain correct letter positions',
      'Keep a comprehensive view of the puzzle'
    ]
  }
] as const;

const COMMON_MISTAKES = [
  'Disturbing green letters in Waffle Game',
  'Neglecting intersection requirements',
  'Focusing on single words instead of the full Waffle Game grid',
  'Making hasty swaps without proper planning'
] as const;

const AVOIDANCE_METHODS = [
  'Plan each Waffle Game move carefully',
  'Verify intersection letter compatibility',
  'Maintain overall puzzle awareness',
  'Use swap attempts strategically'
] as const;

const StrategyTips: React.FC = React.memo(() => {
  return (
    <div className='py-16 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          💡 Advanced Waffle Game Strategies
        </h2>

        <div className='grid lg:grid-cols-2 gap-16 mb-12'>
          <div className='space-y-8'>
            <h3 className='text-2xl font-bold text-slate-800 mb-8'>
              🎯 Essential Waffle Game Tactics
            </h3>
            <ul className='space-y-6 text-slate-700 text-lg'>
              {BASIC_STRATEGIES.map((strategy, index) => (
                <li key={index} className='flex items-start gap-4'>
                  <span className='text-blue-500 text-2xl'>✓</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='space-y-8'>
            <h3 className='text-2xl font-bold text-slate-800 mb-8'>
              ⭐ Pro Waffle Game Tips
            </h3>
            <ul className='space-y-6 text-slate-700 text-lg'>
              {ADVANCED_TIPS.map((tip, index) => (
                <li key={index} className='flex items-start gap-4'>
                  <span className='text-slate-500 text-2xl'>★</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mb-12 pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-12 text-center'>
            🧠 Master Waffle Game: Step-by-Step Guide
          </h3>
          <div className='grid lg:grid-cols-3 gap-12'>
            {STEP_CONTENT.map((step, stepIndex) => (
              <div key={stepIndex} className='text-center space-y-6'>
                <div className='w-16 h-16 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg border border-slate-300'>
                  {stepIndex + 1}
                </div>
                <h4 className='text-xl font-bold text-slate-800 mb-4'>
                  {step.title}
                </h4>
                <ul className='space-y-3 text-slate-600 text-lg text-left'>
                  {step.items.map((item, itemIndex) => (
                    <li key={itemIndex} className='flex items-start gap-2'>
                      <span className='text-blue-400'>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-12 text-center'>
            ⚠️ Common Pitfalls & Avoidance Methods
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Common Mistakes:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {COMMON_MISTAKES.map((mistake, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-red-400 text-xl'>•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Avoidance Methods:
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {AVOIDANCE_METHODS.map((method, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-blue-400 text-xl'>•</span>
                    {method}
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

StrategyTips.displayName = 'StrategyTips';

export default StrategyTips;
