import React from 'react';

const RULE_CARDS = [
  {
    title: 'Goal',
    description:
      'Your goal is to arrange the board so all 6 words are valid and every letter ends up in the right spot.'
  },
  {
    title: 'Move Limit',
    description:
      'You get 15 swaps. If you solve the board before that, you win with moves to spare.'
  },
  {
    title: 'How Swaps Work',
    description:
      'Tap one letter, then tap another to swap them. Each swap counts as one move.'
  },
  {
    title: 'When the Puzzle Is Solved',
    description:
      'The puzzle is complete when every letter is correct and the full board turns green.'
  }
] as const;

const WORD_REQUIREMENTS = [
  'Each answer is a five-letter English word.',
  'The board contains 3 across words and 3 down words.',
  'Proper nouns, abbreviations, and slang do not count.',
  'Letters at intersections must work for both words they touch.'
] as const;

const SWAP_RULES = [
  'You can swap any two visible letters on the board.',
  'The colors update after every move.',
  'Green means correct, yellow means the letter belongs but needs to move, and gray means it is still in the wrong spot.',
  'You can keep swapping after 15 moves, but solving the board within 15 is the goal.'
] as const;

const GameRules: React.FC = React.memo(() => {

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          Game Rules
        </h2>
        <div className='grid lg:grid-cols-2 gap-16'>
          <div className='space-y-12'>
            {RULE_CARDS.slice(0, 2).map(feature => (
              <div key={feature.title} className='text-center'>
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
            {RULE_CARDS.slice(2, 4).map(feature => (
              <div key={feature.title} className='text-center'>
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

        <div className='mt-12 pt-8 border-t border-slate-300'>
          <h3 className='text-2xl font-bold text-slate-800 mb-12 text-center'>
            The Basics
          </h3>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Word Rules
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {WORD_REQUIREMENTS.map((requirement, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-blue-400 text-xl'>•</span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
            <div className='space-y-8'>
              <h4 className='text-xl font-bold text-slate-700 mb-6'>
                Swap Rules
              </h4>
              <ul className='space-y-4 text-slate-600 text-lg'>
                {SWAP_RULES.map((rule, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='text-blue-400 text-xl'>•</span>
                    {rule}
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

GameRules.displayName = 'GameRules';

export default GameRules;
