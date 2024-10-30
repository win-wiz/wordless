import { cn } from "@/lib/utils";
import { useEffect, useState } from 'react';

interface KeyBoardProps {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  matchedLetters: string[];
  isEnterEnabled: boolean;
  noMatchLetters: string[];
  
}

    // 依赖项包括可能在handleKeyDown中使用的状态
export default function KeyBoard({ onKeyPress, onDelete, onEnter, matchedLetters, isEnterEnabled, noMatchLetters }: KeyBoardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null); 

  const handleKeyPress = (letter: string) => {
    setPressedKey(letter);
    onKeyPress(letter);
    setTimeout(() => setPressedKey(null), 200);
  };

  const handleDelete = () => {
    setPressedKey('Del');
    onDelete();
    setTimeout(() => setPressedKey(null), 200);
  };

  const handleEnter = () => {
    setPressedKey('Enter');
    onEnter();
    setTimeout(() => setPressedKey(null), 200);
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
          `md:w-14 md:h-14 w-8 h-8 
          rounded-md font-bold 
          text-zinc-700
          border border-violet-100
          relative
          overflow-hidden
          transition-colors duration-200`,
          isMatched ? 'bg-green-500 text-white border-green-400' : 
          noMatched ? 'bg-zinc-400 text-white border-zinc-300' : 
          'bg-white hover:bg-violet-50',
          pressedKey === letter ? 'after:animate-ripple' : '',
          className
        )}
      >
        {letter}
        <span className={cn(
          "absolute inset-0 bg-black/5 pointer-events-none opacity-0 transition-opacity",
          pressedKey === letter ? "opacity-100" : ""
        )} />
        <span className="absolute inset-0 pointer-events-none">
          <span className={cn(
            "absolute inset-0 rounded-md opacity-0",
            pressedKey === letter ? "animate-press-effect" : ""
          )} />
        </span>
      </button>
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
      <div className="flex justify-center md:space-x-2 space-x-1">
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
      <div className="flex justify-center md:space-x-2 space-x-1">
        <RenderBtn 
          letter="Del"
          isMatched={false}
          noMatched={false}
          onClick={handleDelete}
          className="md:w-20 w-14 bg-violet-100 hover:bg-violet-200 border-violet-200 text-violet-700"
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
          className={cn(
            "md:w-20 w-14",
            isEnterEnabled 
              ? "bg-violet-500 hover:bg-violet-600 text-white border-violet-400" 
              : "bg-violet-200 text-violet-400 border-violet-100 cursor-pointer"
          )}
        />
      </div>
    </div>
  )
}
