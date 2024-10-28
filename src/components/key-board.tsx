import { cn } from "@/lib/utils";
import { useState } from 'react';

interface KeyBoardProps {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  matchedLetters: string[];
  isEnterEnabled: boolean;
  noMatchLetters: string[];
}

export default function KeyBoard({ onKeyPress, onDelete, onEnter, matchedLetters, isEnterEnabled, noMatchLetters }: KeyBoardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleKeyPress = (letter: string) => {
    setPressedKey(letter);
    onKeyPress(letter);
    setTimeout(() => setPressedKey(null), 100); // 动画持续时间
  };

  const handleDelete = () => {
    setPressedKey('Del');
    onDelete();
    setTimeout(() => setPressedKey(null), 100);
  };

  const handleEnter = () => {
    setPressedKey('Enter');
    onEnter();
    setTimeout(() => setPressedKey(null), 100);
  };

  const RenderBtn = ({
    letter,
    isMatched,
    noMatched,
    onClick,
    className = ''
  }: {
    letter: string,
    isMatched: boolean,
    noMatched: boolean,
    onClick: (code: string) => void,
    className?: string
  }) => {
    return (
      <button 
        onClick={() => onClick(letter)} 
        className={cn(
          `md:w-14 md:h-14 rounded-md w-8 h-8 bg-slate-300 text-black font-bold transition-opacity duration-100`,
          isMatched ? 'bg-green-500' : '',
          noMatched ? 'bg-slate-500' : '',
          pressedKey === letter ? 'opacity-70' : '',
          className
        )}
      >{letter}</button>
    )
  }

  return (
    <div className="flex flex-col mt-5 justify-center w-full space-y-2">
      <div className="flex justify-center md:space-x-2 space-x-1">
        {'QWERTYUIOP'.split('').map(letter => (
          <RenderBtn 
            key={letter} 
            letter={letter}
            isMatched={matchedLetters?.includes(letter)}
            noMatched={noMatchLetters?.includes(letter)}
            onClick={handleKeyPress}
          />
        ))}
      </div>
      <div className="flex justify-center space-x-2">
        {'ASDFGHJKL'.split('').map(letter => (
          <RenderBtn 
            key={letter} 
            letter={letter}
            isMatched={matchedLetters?.includes(letter)}
            noMatched={noMatchLetters?.includes(letter)}
            onClick={handleKeyPress}
          />
        ))}
      </div>
      <div className="flex justify-center space-x-2">
        <RenderBtn 
          letter="Del"
          isMatched={false}
          noMatched={false}
          onClick={handleDelete}
          className="md:w-20 w-14"
        />
        {'ZXCVBNM'.split('').map(letter => (
          <RenderBtn 
            key={letter} 
            letter={letter}
            isMatched={matchedLetters?.includes(letter)}
            noMatched={noMatchLetters?.includes(letter)}
            onClick={handleKeyPress}
          />
        ))}
        <RenderBtn 
          letter="Enter"
          isMatched={false}
          noMatched={false}
          onClick={handleEnter}
          className="md:w-20 w-14 bg-purple-500 text-white"
        />
      </div>
    </div>
  )
}
