import { memo } from 'react';

interface LetterTileProps {
  letter: string;
  color: 'green' | 'yellow' | 'gray';
}

const LetterTile = memo(function LetterTile({ letter, color }: LetterTileProps) {
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-zinc-400'
  };

  return (
    <div className={`w-8 h-8 md:w-12 md:h-12 ${colorClasses[color]} text-white font-bold flex items-center justify-center rounded text-sm md:text-base`}>
      {letter}
    </div>
  );
});

interface ExampleRowProps {
  description: string;
  letters: Array<{ letter: string; color: 'green' | 'yellow' | 'gray' }>;
  explanation: string;
}

const ExampleRow = memo(function ExampleRow({ description, letters, explanation }: ExampleRowProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-500">{description}</p>
      <div className="flex items-center gap-8">
        <div className="flex gap-1 md:gap-2 shrink-0">
          {letters.map((item, index) => (
            <LetterTile key={index} letter={item.letter} color={item.color} />
          ))}
        </div>
        <span className="text-sm md:text-base text-zinc-600">{explanation}</span>
      </div>
    </div>
  );
});

const GameExamples = memo(function GameExamples() {
  const examples = [
    {
      description: 'Wordless Game example: If the word is "HEART"',
      letters: [
        { letter: 'H', color: 'green' as const },
        { letter: 'E', color: 'green' as const },
        { letter: 'A', color: 'green' as const },
        { letter: 'R', color: 'green' as const },
        { letter: 'T', color: 'green' as const }
      ],
      explanation: 'All letters are correct and in position in Wordless Game!'
    },
    {
      description: 'Wordless Game example: If you guess "EARTH"',
      letters: [
        { letter: 'E', color: 'yellow' as const },
        { letter: 'A', color: 'yellow' as const },
        { letter: 'R', color: 'green' as const },
        { letter: 'T', color: 'green' as const },
        { letter: 'H', color: 'gray' as const }
      ],
      explanation: 'Some letters are correct but in wrong positions in Wordless Game'
    },
    {
      description: 'Wordless Game example: If you guess "TRAIN"',
      letters: [
        { letter: 'T', color: 'green' as const },
        { letter: 'R', color: 'yellow' as const },
        { letter: 'A', color: 'yellow' as const },
        { letter: 'I', color: 'gray' as const },
        { letter: 'N', color: 'gray' as const }
      ],
      explanation: 'T is correct, R and A exist but in wrong spots in Wordless Game'
    },
    {
      description: 'Wordless Game example: If you guess "CLOUD"',
      letters: [
        { letter: 'C', color: 'gray' as const },
        { letter: 'L', color: 'gray' as const },
        { letter: 'O', color: 'gray' as const },
        { letter: 'U', color: 'gray' as const },
        { letter: 'D', color: 'gray' as const }
      ],
      explanation: 'None of these letters are in the Wordless Game word'
    }
  ];

  return (
    <div className="bg-white/50 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-zinc-700 mb-4">Wordless Game Examples:</h3>
      {examples.map((example, index) => (
        <ExampleRow
          key={index}
          description={example.description}
          letters={example.letters}
          explanation={example.explanation}
        />
      ))}
    </div>
  );
});

export default GameExamples; 