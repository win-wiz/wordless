import { cn } from "@/lib/utils";
import { memo, useCallback, useMemo, useState } from 'react';

interface KeyBoardProps {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  matchedLetters: string[];
  isEnterEnabled: boolean;
  noMatchLetters: string[];
}

// 创建按键行组件
const KeyRow = memo(({ 
  letters, 
  matchedLetters, 
  noMatchLetters, 
  onKeyClick,
  pressedKey 
}: { 
  letters: string[], 
  matchedLetters: string[], 
  noMatchLetters: string[],
  onKeyClick: (letter: string) => void,
  pressedKey: string | null
}) => {
  return (
    <div className="flex justify-center md:space-x-2 space-x-1">
      {letters.map(letter => (
        <KeyButton
          key={letter}
          letter={letter}
          isMatched={matchedLetters?.includes(letter)}
          noMatched={noMatchLetters?.includes(letter)}
          onClick={onKeyClick}
          pressedKey={pressedKey}
        />
      ))}
    </div>
  );
});

KeyRow.displayName = 'KeyRow';

// 创建按键组件
const KeyButton = memo(({ 
  letter, 
  isMatched, 
  noMatched, 
  onClick, 
  pressedKey,
  className = '' 
}: {
  letter: string,
  isMatched: boolean,
  noMatched: boolean,
  onClick: (letter: string) => void,
  pressedKey: string | null,
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
  );
});

KeyButton.displayName = 'KeyButton';

function KeyBoard({ 
  onKeyPress, 
  onDelete, 
  onEnter, 
  matchedLetters, 
  isEnterEnabled, 
  noMatchLetters 
}: KeyBoardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // 使用 useCallback 优化事件处理函数
  const handleKeyPress = useCallback((letter: string) => {
    setPressedKey(letter);
    onKeyPress(letter);
    setTimeout(() => setPressedKey(null), 200);
  }, [onKeyPress]);

  const handleDelete = useCallback(() => {
    setPressedKey('Del');
    onDelete();
    setTimeout(() => setPressedKey(null), 200);
  }, [onDelete]);

  const handleEnter = useCallback(() => {
    setPressedKey('Enter');
    onEnter();
    setTimeout(() => setPressedKey(null), 200);
  }, [onEnter]);

  // 使用 useMemo 缓存键盘行数据
  const keyboardRows = useMemo(() => [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split('')
  ], []);

  return (
    <div className="flex flex-col mt-5 justify-center w-full space-y-2">
      {/* 第一行 */}
      <KeyRow
        letters={keyboardRows[0] || []}
        matchedLetters={matchedLetters}
        noMatchLetters={noMatchLetters}
        onKeyClick={handleKeyPress}
        pressedKey={pressedKey}
      />

      {/* 第二行 */}
      <KeyRow
        letters={keyboardRows[1] || []}
        matchedLetters={matchedLetters}
        noMatchLetters={noMatchLetters}
        onKeyClick={handleKeyPress}
        pressedKey={pressedKey}
      />

      {/* 第三行 */}
      <div className="flex justify-center md:space-x-2 space-x-1">
        <KeyButton
          letter="Del"
          isMatched={false}
          noMatched={false}
          onClick={handleDelete}
          pressedKey={pressedKey}
          className="md:w-20 w-14 bg-violet-100 hover:bg-violet-200 border-violet-200 text-violet-700"
        />
        {keyboardRows[2]?.map(letter => (
          <KeyButton
            key={letter}
            letter={letter}
            isMatched={matchedLetters?.includes(letter)}
            noMatched={noMatchLetters?.includes(letter)}
            onClick={handleKeyPress}
            pressedKey={pressedKey}
          />
        ))}
        <KeyButton
          letter="Enter"
          isMatched={false}
          noMatched={false}
          onClick={handleEnter}
          pressedKey={pressedKey}
          className={cn(
            "md:w-20 w-14",
            isEnterEnabled 
              ? "bg-violet-500 hover:bg-violet-600 text-white border-violet-400" 
              : "bg-violet-200 text-violet-400 border-violet-100 cursor-pointer"
          )}
        />
      </div>
    </div>
  );
}

export default memo(KeyBoard);
