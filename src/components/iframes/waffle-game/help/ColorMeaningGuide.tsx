import React, { useMemo } from 'react';

interface WaffleTileProps {
  letter?: string;
  color?: 'green' | 'yellow' | 'white' | 'gray';
  isEmpty?: boolean;
  className?: string;
  isIntersection?: boolean;
}

const WaffleTile: React.FC<WaffleTileProps> = React.memo(
  ({
    letter,
    color = 'white',
    isEmpty = false,
    className = '',
    isIntersection = false
  }) => {
    const colorClasses = useMemo(
      () => ({
        green: 'text-white border-none shadow-md',
        yellow: 'text-white border-none shadow-md',
        white: 'bg-slate-200 text-slate-700 border-2 border-slate-400',
        gray: 'text-white border-none shadow-md'
      }),
      []
    );

    const computedClasses = useMemo(() => {
      if (isEmpty) {
        return `w-12 h-12 ${className}`;
      }

      const baseClasses = className || 'w-12 h-12';
      const intersectionClasses = isIntersection
        ? 'ring-4 ring-blue-500 ring-offset-2 shadow-lg'
        : 'shadow-md';

      return `${baseClasses} flex items-center justify-center font-bold text-lg rounded-lg ${intersectionClasses} ${colorClasses[color]}`;
    }, [className, isIntersection, color, isEmpty, colorClasses]);

    const getCustomStyle = () => {
      if (color === 'green') {
        return {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          border: '2px solid #10B981',
          color: '#ffffff'
        };
      }
      if (color === 'yellow') {
        return {
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          border: '2px solid #F59E0B',
          color: '#ffffff'
        };
      }
      if (color === 'gray') {
        return {
          background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
          border: '2px solid #94A3B8',
          color: '#ffffff'
        };
      }
      return {};
    };

    if (isEmpty) {
      return <div className={computedClasses} />;
    }

    return (
      <div className={computedClasses} style={getCustomStyle()}>
        {letter}
      </div>
    );
  }
);

WaffleTile.displayName = 'WaffleTile';

// Horizontal word example component
const HorizontalWordExample: React.FC<{
  letters: Array<{
    letter: string;
    color: 'green' | 'yellow' | 'gray' | 'white';
  }>;
  title: string;
  description: string;
}> = React.memo(({ letters, title, description }) => {
  const renderedTiles = useMemo(
    () =>
      letters.map((item, index) => (
        <WaffleTile
          key={index}
          letter={item.letter}
          color={item.color}
          className='w-12 h-12 text-base'
        />
      )),
    [letters]
  );

  return (
    <div className='text-center space-y-4'>
      <h4 className='text-lg font-bold text-gray-800'>{title}</h4>
      <div className='flex gap-2 justify-center'>{renderedTiles}</div>
      <p className='text-gray-600 text-sm max-w-xs mx-auto'>{description}</p>
    </div>
  );
});

HorizontalWordExample.displayName = 'HorizontalWordExample';

// Vertical word example component
const VerticalWordExample: React.FC<{
  letters: Array<{
    letter: string;
    color: 'green' | 'yellow' | 'gray' | 'white';
  }>;
  title: string;
  description: string;
}> = React.memo(({ letters, title, description }) => {
  const renderedTiles = useMemo(
    () =>
      letters.map((item, index) => (
        <WaffleTile
          key={index}
          letter={item.letter}
          color={item.color}
          className='w-12 h-12 text-base'
        />
      )),
    [letters]
  );

  return (
    <div className='text-center space-y-4'>
      <h4 className='text-lg font-bold text-gray-800'>{title}</h4>
      <div className='flex flex-col gap-2 items-center'>{renderedTiles}</div>
      <p className='text-gray-600 text-sm max-w-xs mx-auto'>{description}</p>
    </div>
  );
});

VerticalWordExample.displayName = 'VerticalWordExample';

// Crossword intersection example component
const CrosswordExample: React.FC<{
  centerLetter: string;
  centerColor: 'green' | 'yellow' | 'gray';
  horizontalLetters: Array<{
    letter: string;
    color: 'green' | 'yellow' | 'gray' | 'white';
  }>;
  verticalLetters: Array<{
    letter: string;
    color: 'green' | 'yellow' | 'gray' | 'white';
  }>;
  title: string;
  description: string;
}> = React.memo(
  ({
    centerLetter,
    centerColor,
    horizontalLetters,
    verticalLetters,
    title,
    description
  }) => {
    const renderedStructure = useMemo(
      () => (
        <div className='flex flex-col items-center'>
          {/* Top letter */}
          <WaffleTile
            letter={verticalLetters?.[0]?.letter}
            color={verticalLetters?.[0]?.color}
            className='w-12 h-12 text-base mb-2'
          />

          {/* Horizontal row */}
          <div className='flex gap-2 items-center'>
            <WaffleTile
              letter={horizontalLetters?.[0]?.letter}
              color={horizontalLetters?.[0]?.color}
              className='w-12 h-12 text-base'
            />
            <WaffleTile
              letter={centerLetter}
              color={centerColor}
              isIntersection={true}
              className='w-12 h-12 text-base'
            />
            <WaffleTile
              letter={horizontalLetters?.[1]?.letter}
              color={horizontalLetters?.[1]?.color}
              className='w-12 h-12 text-base'
            />
          </div>

          {/* Bottom letter */}
          <WaffleTile
            letter={verticalLetters?.[1]?.letter}
            color={verticalLetters?.[1]?.color}
            className='w-12 h-12 text-base mt-2'
          />
        </div>
      ),
      [centerLetter, centerColor, horizontalLetters, verticalLetters]
    );

    return (
      <div className='text-center space-y-6'>
        <h4 className='text-lg font-bold text-gray-800'>{title}</h4>
        {renderedStructure}
        <p className='text-gray-600 text-sm max-w-xs mx-auto'>{description}</p>
      </div>
    );
  }
);

CrosswordExample.displayName = 'CrosswordExample';

const ColorMeaningGuide: React.FC = React.memo(() => {
  const headerContent = useMemo(
    () => (
      <div className='text-center mb-16'>
        <h2 className='text-4xl font-bold text-slate-800 mb-8'>
          🎨 Waffle Game Color Guide: Master the Visual Clues
        </h2>
        <div className='mb-8'>
          <h3 className='text-2xl font-bold text-slate-800 mb-4'>
            🔍 Understanding Waffle Game Colors
          </h3>
          <p className='text-slate-700 text-xl leading-relaxed max-w-4xl mx-auto'>
            Master the Waffle Game with our comprehensive color guide. Each
            color in Waffle Game provides crucial feedback about letter
            placement. Understanding these visual clues is essential for solving
            Waffle Game puzzles efficiently and becoming a Waffle Game expert.
          </p>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header section */}
        {headerContent}

        {/* Green - Correct Position */}
        <div className='mb-16'>
          <div className='flex items-center justify-center gap-8 mb-10'>
            <WaffleTile
              letter='O'
              color='green'
              className='w-16 h-16 text-xl'
            />
            <div className='text-center'>
              <h3 className='text-3xl font-bold text-green-700 mb-2'>
                🟢 Green Letters: Perfect Placement in Waffle Game
              </h3>
              <p className='text-green-600 text-xl'>
                Green indicates the letter is correctly positioned in your
                Waffle Game solution
              </p>
            </div>
          </div>

          <div className='text-center mb-12'>
            <h4 className='text-xl font-bold text-green-800 mb-8'>
              ✅ What Green Letters Mean in Waffle Game:
            </h4>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto'>
              <div className='text-green-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Correct Letter
                </span>
                <p>This letter belongs to the target word in Waffle Game</p>
              </div>
              <div className='text-green-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Perfect Position
                </span>
                <p>The letter placement is exactly where it should be</p>
              </div>
              <div className='text-green-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  No Action Needed
                </span>
                <p>Keep this letter in place during Waffle Game swaps</p>
              </div>
              <div className='text-green-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Strategic Anchor
                </span>
                <p>Use green letters as reference points for solving</p>
              </div>
            </div>
          </div>

          <div className='text-center'>
            <h4 className='text-xl font-bold text-green-800 mb-8'>
              🎮 Waffle Game Scenarios with Green Letters
            </h4>
            <div className='grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto'>
              <HorizontalWordExample
                letters={[
                  { letter: 'W', color: 'white' },
                  { letter: 'O', color: 'green' },
                  { letter: 'R', color: 'white' },
                  { letter: 'L', color: 'white' },
                  { letter: 'D', color: 'white' }
                ]}
                title='Horizontal Word Success'
                description='Green O confirms correct placement in position 2 of WORLD'
              />

              <VerticalWordExample
                letters={[
                  { letter: 'M', color: 'white' },
                  { letter: 'O', color: 'green' },
                  { letter: 'U', color: 'white' },
                  { letter: 'S', color: 'white' },
                  { letter: 'E', color: 'white' }
                ]}
                title='Vertical Word Success'
                description='Green O shows perfect placement in vertical MOUSE formation'
              />

              <CrosswordExample
                centerLetter='O'
                centerColor='green'
                horizontalLetters={[
                  { letter: 'W', color: 'white' },
                  { letter: 'R', color: 'white' }
                ]}
                verticalLetters={[
                  { letter: 'M', color: 'white' },
                  { letter: 'U', color: 'white' }
                ]}
                title='Intersection Victory'
                description='Green O works perfectly for both crossing words in Waffle Game'
              />
            </div>
          </div>
        </div>

        {/* Yellow - Wrong Position */}
        <div className='mb-16'>
          <div className='flex items-center justify-center gap-8 mb-10'>
            <WaffleTile
              letter='R'
              color='yellow'
              className='w-16 h-16 text-xl'
            />
            <div className='text-center'>
              <h3 className='text-3xl font-bold text-yellow-700 mb-2'>
                🟡 Yellow Letters: Right Letter, Wrong Spot
              </h3>
              <p className='text-yellow-600 text-xl'>
                Yellow means the letter belongs in the word but needs
                repositioning in Waffle Game
              </p>
            </div>
          </div>

          <div className='text-center mb-12'>
            <h4 className='text-xl font-bold text-yellow-800 mb-8'>
              ⚠️ Understanding Yellow Letters in Waffle Game:
            </h4>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto'>
              <div className='text-yellow-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Valid Letter
                </span>
                <p>This letter is part of the target Waffle Game word</p>
              </div>
              <div className='text-yellow-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Wrong Position
                </span>
                <p>Current placement is incorrect and needs adjustment</p>
              </div>
              <div className='text-yellow-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Requires Swapping
                </span>
                <p>Move this letter to find its correct Waffle Game position</p>
              </div>
              <div className='text-yellow-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Strategic Clue
                </span>
                <p>Yellow letters provide valuable solving hints</p>
              </div>
            </div>
          </div>

          <div className='text-center'>
            <h4 className='text-xl font-bold text-yellow-800 mb-8'>
              🎮 Waffle Game Yellow Letter Examples
            </h4>
            <div className='grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto'>
              <HorizontalWordExample
                letters={[
                  { letter: 'R', color: 'yellow' },
                  { letter: 'I', color: 'white' },
                  { letter: 'G', color: 'white' },
                  { letter: 'H', color: 'white' },
                  { letter: 'T', color: 'white' }
                ]}
                title='Misplaced Letter'
                description='R belongs in RIGHT but not at position 1 in Waffle Game'
              />

              <VerticalWordExample
                letters={[
                  { letter: 'P', color: 'white' },
                  { letter: 'R', color: 'yellow' },
                  { letter: 'I', color: 'white' },
                  { letter: 'N', color: 'white' },
                  { letter: 'T', color: 'white' }
                ]}
                title='Vertical Mismatch'
                description='R exists in PRINT but requires different placement'
              />

              <CrosswordExample
                centerLetter='R'
                centerColor='yellow'
                horizontalLetters={[
                  { letter: 'T', color: 'white' },
                  { letter: 'U', color: 'white' }
                ]}
                verticalLetters={[
                  { letter: 'F', color: 'white' },
                  { letter: 'O', color: 'white' }
                ]}
                title='Intersection Challenge'
                description='R belongs to at least one word but needs relocation'
              />
            </div>
          </div>
        </div>

        {/* Gray - Not in Word */}
        <div className='mb-16'>
          <div className='flex items-center justify-center gap-8 mb-10'>
            <WaffleTile letter='X' color='gray' className='w-16 h-16 text-xl' />
            <div className='text-center'>
              <h3 className='text-3xl font-bold text-gray-700 mb-2'>
                ⚫ Gray Letters: Wrong Letter Choice
              </h3>
              <p className='text-gray-600 text-xl'>
                Gray indicates the letter doesn't belong in this Waffle Game
                word
              </p>
            </div>
          </div>

          <div className='text-center mb-12'>
            <h4 className='text-xl font-bold text-gray-800 mb-8'>
              ❌ What Gray Letters Mean in Waffle Game:
            </h4>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto'>
              <div className='text-gray-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Invalid Letter
                </span>
                <p>This letter doesn't belong in this specific word</p>
              </div>
              <div className='text-gray-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Must Replace
                </span>
                <p>Swap with letters from other Waffle Game positions</p>
              </div>
              <div className='text-gray-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Final Solution Step
                </span>
                <p>Often the last piece in completing Waffle Game puzzles</p>
              </div>
              <div className='text-gray-700 text-lg text-center'>
                <span className='block font-semibold mb-2 text-xl'>
                  Elimination Tool
                </span>
                <p>Helps narrow down possible letter combinations</p>
              </div>
            </div>
          </div>

          <div className='text-center'>
            <h4 className='text-xl font-bold text-gray-800 mb-8'>
              🎮 Waffle Game Gray Letter Scenarios
            </h4>
            <div className='grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto'>
              <HorizontalWordExample
                letters={[
                  { letter: 'X', color: 'gray' },
                  { letter: 'O', color: 'white' },
                  { letter: 'R', color: 'white' },
                  { letter: 'D', color: 'white' },
                  { letter: 'S', color: 'white' }
                ]}
                title='Wrong Letter'
                description='X does not fit in WORDS and must be swapped in Waffle Game'
              />

              <VerticalWordExample
                letters={[
                  { letter: 'T', color: 'white' },
                  { letter: 'A', color: 'white' },
                  { letter: 'B', color: 'white' },
                  { letter: 'Z', color: 'gray' },
                  { letter: 'E', color: 'white' }
                ]}
                title='Vertical Error'
                description='Z disrupts TABLE formation and needs replacement'
              />

              <CrosswordExample
                centerLetter='Q'
                centerColor='gray'
                horizontalLetters={[
                  { letter: 'M', color: 'white' },
                  { letter: 'S', color: 'white' }
                ]}
                verticalLetters={[
                  { letter: 'B', color: 'white' },
                  { letter: 'K', color: 'white' }
                ]}
                title='Intersection Block'
                description='Q fits neither horizontal nor vertical word in Waffle Game'
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className='text-center bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl'>
          <h3 className='text-2xl font-bold text-gray-800 mb-6'>
            🎯 Master Waffle Game Strategy
          </h3>
          <div className='grid md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            <div className='text-center'>
              <div className='text-4xl mb-4'>🟢</div>
              <h4 className='font-bold text-green-700 mb-2'>
                Secure Green First
              </h4>
              <p className='text-gray-600'>
                Build your Waffle Game solution around confirmed green letters
              </p>
            </div>
            <div className='text-center'>
              <div className='text-4xl mb-4'>🟡</div>
              <h4 className='font-bold text-yellow-700 mb-2'>
                Relocate Yellow
              </h4>
              <p className='text-gray-600'>
                Find the correct positions for yellow letters in Waffle Game
              </p>
            </div>
            <div className='text-center'>
              <div className='text-4xl mb-4'>⚫</div>
              <h4 className='font-bold text-gray-700 mb-2'>Replace Gray</h4>
              <p className='text-gray-600'>
                Swap gray letters to complete your Waffle Game puzzle
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ColorMeaningGuide.displayName = 'ColorMeaningGuide';

export default ColorMeaningGuide;
