import React, { useMemo } from 'react';
import WaffleDisplayTile from '@/components/iframes/waffle-game/waffle-display-tile';

const WaffleGrid = React.memo(() => {
  const gridData = useMemo(
    () => [
      { color: 'yellow' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'yellow' as const, isEmpty: false },
      { color: 'yellow' as const, isEmpty: false },
      { color: 'yellow' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'white' as const, isEmpty: true },
      { color: 'green' as const, isEmpty: false },
      { color: 'white' as const, isEmpty: true },
      { color: 'green' as const, isEmpty: false },
      { color: 'yellow' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'white' as const, isEmpty: true },
      { color: 'green' as const, isEmpty: false },
      { color: 'white' as const, isEmpty: true },
      { color: 'green' as const, isEmpty: false },
      { color: 'yellow' as const, isEmpty: false },
      { color: 'yellow' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false },
      { color: 'yellow' as const, isEmpty: false },
      { color: 'green' as const, isEmpty: false }
    ],
    []
  );

  return (
    <div className='grid grid-cols-5 gap-2 w-fit mx-auto relative'>
      {gridData.map((tile, index) => (
        <WaffleDisplayTile
          key={index}
          color={tile.color}
          isEmpty={tile.isEmpty}
        />
      ))}
    </div>
  );
});

WaffleGrid.displayName = 'WaffleGrid';

const GameGridDisplay: React.FC = React.memo(() => {
  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto text-center'>
        <h2 className='text-4xl font-bold text-slate-800 mb-12'>
          🧩 Waffle Game Grid Layout
        </h2>
        <div className='inline-block mb-12'>
          <WaffleGrid />
        </div>
        <p className='text-slate-700 text-xl mb-16 max-w-4xl mx-auto leading-relaxed'>
          The Waffle Game grid features 21 tiles (numbered 0-20), each
          displaying a letter and color-coded feedback. Special blue rings
          highlight crucial intersection points where letters must work for both
          horizontal and vertical words, making each Waffle Game puzzle a unique
          challenge.
        </p>
        <div className='mt-16'>
          <h3 className='text-2xl font-bold text-slate-800 mb-8'>
            📍 Understanding the Waffle Game Grid
          </h3>
          <div className='grid lg:grid-cols-2 gap-12 text-left max-w-4xl mx-auto'>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-4'>
                Horizontal Words in Waffle Game:
              </h4>
              <ul className='space-y-3 text-slate-700 text-lg'>
                <li className='flex items-center gap-3'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                  Top Row: Positions 0-4 form first word
                </li>
                <li className='flex items-center gap-3'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                  Middle Row: Positions 8-12 create second word
                </li>
                <li className='flex items-center gap-3'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                  Bottom Row: Positions 16-20 complete third word
                </li>
              </ul>
            </div>
            <div className='space-y-6'>
              <h4 className='text-xl font-bold text-slate-700 mb-4'>
                Vertical Words in Waffle Game:
              </h4>
              <ul className='space-y-3 text-slate-700 text-lg'>
                <li className='flex items-center gap-3'>
                  <span className='w-2 h-2 bg-slate-500 rounded-full'></span>
                  Left Column: Positions 0-16 form first word
                </li>
                <li className='flex items-center gap-3'>
                  <span className='w-2 h-2 bg-slate-500 rounded-full'></span>
                  Middle Column: Positions 2-18 create second word
                </li>
                <li className='flex items-center gap-3'>
                  <span className='w-2 h-2 bg-slate-500 rounded-full'></span>
                  Right Column: Positions 4-20 complete third word
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

GameGridDisplay.displayName = 'GameGridDisplay';

export default GameGridDisplay;
