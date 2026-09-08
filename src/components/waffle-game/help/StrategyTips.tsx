import React from 'react';

const BASIC_STRATEGIES = [
  'Start with the intersections because they affect two words at once.',
  'Leave green letters where they are.',
  'Use yellow letters to test likely positions before making late moves.',
  'Look for the word that feels most obvious, then let that clue help the rest.'
] as const;

const ADVANCED_TIPS = [
  'Look for common endings and letter pairs like -ER, -ED, or TH.',
  'If one swap helps two words, it is usually worth trying first.',
  'Step back and reread the whole board when you feel stuck.',
  'The last few moves are easier once the pattern starts to click.'
] as const;

const STEP_CONTENT = [
  {
    title: 'Step 1: Find Your Anchors',
    items: [
      'Find the green letters that are already locked in.',
      'Check which intersections already give you strong clues.',
      'Notice any common word endings or familiar patterns.',
      'Pick one area of the board that already looks close.'
    ]
  },
  {
    title: 'Step 2: Work the Best Clues',
    items: [
      'Start with the swap that improves the most information.',
      'Use intersections to guide both across and down words.',
      'Avoid random swaps once the board starts making sense.',
      'Keep an eye on your remaining moves.'
    ]
  },
  {
    title: 'Step 3: Clean Up the Board',
    items: [
      'Recheck the colors after every move.',
      'Leave correct letters in place.',
      'Use the last few swaps to tidy up loose letters.',
      'If something feels off, zoom back out and look at the full grid again.'
    ]
  }
] as const;

const COMMON_MISTAKES = [
  'Moving a green letter too early.',
  'Forgetting that an intersection has to satisfy two words.',
  'Tunnel-visioning on one word and ignoring the rest of the grid.',
  'Making quick swaps without learning anything from the last move.'
] as const;

const AVOIDANCE_METHODS = [
  'Pause for a second before every swap.',
  'Check whether a move helps both an across word and a down word.',
  'Keep scanning the whole board instead of one line at a time.',
  'Treat every move like a clue, not just a guess.'
] as const;

const StrategyTips: React.FC = React.memo(() => {
  return (
    <div className='py-16 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          Strategy Tips
        </h2>

        <div className='grid lg:grid-cols-2 gap-16 mb-12'>
          <div className='space-y-8'>
            <h3 className='text-2xl font-bold text-slate-800 mb-8'>
              What Usually Works
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
              Extra Tips Once You Get Comfortable
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
            A Simple Solving Flow
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
            Common Pitfalls
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Mistakes to Watch For
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
                How to Avoid Them
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
