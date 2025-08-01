import React, { useMemo } from 'react';

const GameIntroduction: React.FC = React.memo(() => {
  const gameFeatures = useMemo(
    () => [
      'Classic memory card-matching with colorful emojis',
      'Progressive difficulty levels from beginner to expert',
      'Time-based challenges with bonus time rewards',
      'Score tracking based on efficiency and speed'
    ],
    []
  );

  const targetAudience = useMemo(
    () => [
      'Memory game enthusiasts seeking fun challenges',
      'Players who enjoy visual pattern recognition',
      'Anyone looking to improve memory and concentration',
      'Casual gamers who love emoji-themed puzzles'
    ],
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-12 text-center'>
          🃏 What is Emoji Memory Game? - The Ultimate Brain Training Experience
        </h2>
        <div className='grid lg:grid-cols-2 gap-16'>
          <div className='space-y-8'>
            <p className='text-slate-700 text-xl leading-relaxed'>
              Emoji Memory Game transforms the beloved classic memory card game into an exciting digital brain training experience.
              This innovative game features vibrant, colorful emoji cards that you flip to discover
              matching pairs. Every round enhances your cognitive abilities, sharpens concentration, and
              develops superior pattern recognition skills through entertaining gameplay.
            </p>
            <div className='space-y-6'>
              <h4 className='text-2xl font-bold text-slate-800 mb-4'>
                Unique Features:
              </h4>
              <ul className='space-y-4 text-slate-700 text-lg'>
                {gameFeatures.map((feature, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-purple-500 text-2xl'>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='space-y-8'>
            <div className='space-y-6'>
              <h4 className='text-2xl font-bold text-slate-800 mb-4'>
                Who Will Love This Game?
              </h4>
              <div className='space-y-4 text-slate-700 text-lg'>
                {targetAudience.map((audience, index) => (
                  <p key={index} className='flex items-center gap-3'>
                    <span className='text-purple-600 text-xl'>✅</span>
                    {audience}
                  </p>
                ))}
              </div>
            </div>
            <div className='mt-8 pt-8 border-t border-slate-200'>
              <h4 className='text-xl font-bold text-slate-800 mb-4'>
                💡 Getting Started
              </h4>
              <p className='text-slate-700 text-lg leading-relaxed'>
                New to the game? Perfect! Begin with beginner difficulty
                to master the fundamentals. This comprehensive game offers intuitive visual feedback and detailed progress tracking,
                making it effortless to enhance your memory abilities through practice. Every successful match
                builds confidence while strengthening cognitive focus and mental agility.
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