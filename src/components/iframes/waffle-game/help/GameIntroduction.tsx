import React, { useMemo } from 'react';

const GameIntroduction: React.FC = React.memo(() => {
  const gameFeatures = useMemo(
    () => [
      'Solve 3 across and 3 down five-letter words',
      'Use the intersections to figure out the board',
      'Finish the puzzle in 15 swaps',
      'Use color feedback to guide every move'
    ],
    []
  );

  const playModes = useMemo(
    () => [
      'Daily mode gives you one new puzzle every day',
      'Unlimited mode lets you load a new board any time',
      'Works smoothly on desktop, tablet, and mobile',
      'No download needed, just open and play in your browser'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-12 text-center'>
          What Is Waffle?
        </h2>
        <div className='grid lg:grid-cols-2 gap-16'>
          <div className='space-y-8'>
            <p className='text-slate-700 text-xl leading-relaxed'>
              Waffle is a word puzzle where every move matters. Your goal is to
              rearrange the letters on a cross-shaped 5x5 grid and complete 6
              connected five-letter words.
            </p>
            <p className='text-slate-600 text-lg leading-relaxed'>
              It feels a bit like a mix of Wordle and a word grid puzzle. The
              letters are already on the board, so the challenge is not guessing
              new letters. It&apos;s figuring out the smartest swaps.
            </p>
            <div className='space-y-6'>
              <h4 className='text-2xl font-bold text-slate-800 mb-4'>
                Why Players Like It
              </h4>
              <ul className='space-y-4 text-slate-700 text-lg'>
                {gameFeatures.map((feature, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-blue-500 text-2xl'>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='space-y-8'>
            <div className='space-y-6'>
              <h4 className='text-2xl font-bold text-slate-800 mb-4'>
                Ways to Play
              </h4>
              <div className='space-y-4 text-slate-700 text-lg'>
                {playModes.map((mode, index) => (
                  <p key={index} className='flex items-center gap-3'>
                    <span className='text-blue-600 text-xl'>✅</span>
                    {mode}
                  </p>
                ))}
              </div>
            </div>
            <div className='mt-8 pt-8 border-t border-slate-200'>
              <h4 className='text-xl font-bold text-slate-800 mb-4'>
                Getting Started
              </h4>
              <p className='text-slate-700 text-lg leading-relaxed'>
                New to Waffle? Start with the green letters, pay attention to
                the intersections, and use the yellow tiles to work out where a
                letter really belongs. Once the board starts opening up, the
                last few swaps usually come together fast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

GameIntroduction.displayName = 'GameIntroduction';

export default GameIntroduction;
