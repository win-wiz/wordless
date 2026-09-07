import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { memo, useCallback, useMemo } from 'react';
import type { ReactNode } from "react";
import type { KeyboardLetterState } from "@/lib/game-state";
import type { KeyboardLetterStateMap } from "@/lib/game-state";

interface KeyBoardProps {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
  onEnter: () => void | Promise<void>;
  letterStates: KeyboardLetterStateMap;
  isEnterEnabled: boolean;
  isInteractionLocked: boolean;
  isLoadingWord: boolean;
  isProcessingEnter: boolean;
  statusMessage: string;
  activeKeyboardKey: string | null;
}

// 创建按键行组件
const KeyRow = memo(({ 
  letters, 
  letterStates,
  onKeyClick,
  pressedKey,
  disabled,
}: { 
  letters: string[], 
  letterStates: KeyboardLetterStateMap,
  onKeyClick: (letter: string) => void,
  pressedKey: string | null,
  disabled: boolean,
}) => {
  return (
    <div className="flex justify-center md:space-x-2 space-x-1">
      {letters.map(letter => (
        <KeyButton
          key={letter}
          keyId={letter}
          label={letter}
          letterState={letterStates[letter] ?? 'unused'}
          onClick={onKeyClick}
          pressedKey={pressedKey}
          disabled={disabled}
        />
      ))}
    </div>
  );
});

KeyRow.displayName = 'KeyRow';

// 创建按键组件
const KeyButton = memo(({ 
  keyId,
  label,
  letterState,
  onClick, 
  pressedKey,
  className = '',
  disabled = false,
}: {
  keyId: string,
  label: ReactNode,
  letterState: KeyboardLetterState,
  onClick: (keyId: string) => void,
  pressedKey: string | null,
  className?: string,
  disabled?: boolean,
}) => {
  return (
    <button 
      type="button"
      disabled={disabled}
      onClick={() => onClick(keyId)}
      className={cn(
        `md:w-14 md:h-14 w-8 h-8 
        rounded-md font-bold 
        text-zinc-700
        border border-violet-100
        relative
        overflow-hidden
        transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55`,
        letterState === 'correct' ? 'bg-green-500 text-white border-green-400' :
        letterState === 'present' ? 'bg-yellow-500 text-white border-yellow-400' :
        letterState === 'absent' ? 'bg-zinc-400 text-white border-zinc-300' :
        'bg-white hover:bg-violet-50',
        !disabled && pressedKey === keyId ? 'after:animate-ripple scale-[0.97]' : '',
        className
      )}
    >
      {label}
      <span className={cn(
        "absolute inset-0 bg-black/5 pointer-events-none opacity-0 transition-opacity",
        pressedKey === keyId ? "opacity-100" : ""
      )} />
      <span className="absolute inset-0 pointer-events-none">
        <span className={cn(
          "absolute inset-0 rounded-md opacity-0",
          pressedKey === keyId ? "animate-press-effect" : ""
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
  letterStates,
  isEnterEnabled, 
  isInteractionLocked,
  isLoadingWord,
  isProcessingEnter,
  statusMessage,
  activeKeyboardKey,
}: KeyBoardProps) {
  const enterLabel = isLoadingWord ? 'Wait' : 'Enter';
  const canUseKeyboard = !isInteractionLocked;

  // 使用 useCallback 优化事件处理函数
  const handleKeyPress = useCallback((letter: string) => {
    if (!canUseKeyboard) {
      return;
    }

    onKeyPress(letter);
  }, [canUseKeyboard, onKeyPress]);

  const handleDelete = useCallback(() => {
    if (!canUseKeyboard) {
      return;
    }

    onDelete();
  }, [canUseKeyboard, onDelete]);

  const handleEnter = useCallback(() => {
    if (!canUseKeyboard || !isEnterEnabled) {
      return;
    }

    onEnter();
  }, [canUseKeyboard, isEnterEnabled, onEnter]);

  // 使用 useMemo 缓存键盘行数据
  const keyboardRows = useMemo(() => [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split('')
  ], []);

  return (
    <div className="flex flex-col mt-5 justify-center w-full space-y-2">
      <div
        aria-live="polite"
        className="mb-1 text-center text-sm font-medium text-violet-600 animate-fadeIn"
      >
        {statusMessage}
      </div>
      {/* 第一行 */}
      <KeyRow
        letters={keyboardRows[0] || []}
        letterStates={letterStates}
        onKeyClick={handleKeyPress}
        pressedKey={activeKeyboardKey}
        disabled={!canUseKeyboard}
      />

      {/* 第二行 */}
      <KeyRow
        letters={keyboardRows[1] || []}
        letterStates={letterStates}
        onKeyClick={handleKeyPress}
        pressedKey={activeKeyboardKey}
        disabled={!canUseKeyboard}
      />

      {/* 第三行 */}
      <div className="flex justify-center md:space-x-2 space-x-1">
        <KeyButton
          keyId="Del"
          label="Del"
          letterState="unused"
          onClick={handleDelete}
          pressedKey={activeKeyboardKey}
          disabled={!canUseKeyboard}
          className="md:w-20 w-14 bg-violet-100 hover:bg-violet-200 border-violet-200 text-violet-700"
        />
        {keyboardRows[2]?.map(letter => (
          <KeyButton
            key={letter}
            keyId={letter}
            label={letter}
            letterState={letterStates[letter] ?? 'unused'}
            onClick={handleKeyPress}
            pressedKey={activeKeyboardKey}
            disabled={!canUseKeyboard}
          />
        ))}
        <KeyButton
          keyId="Enter"
          label={
            isProcessingEnter ? (
              <span className="flex items-center gap-1.5">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                <span>Wait</span>
              </span>
            ) : (
              enterLabel
            )
          }
          letterState="unused"
          onClick={handleEnter}
          pressedKey={activeKeyboardKey}
          disabled={!isEnterEnabled}
          className={cn(
            "md:w-20 w-14",
            isProcessingEnter
              ? "bg-violet-300 text-white border-violet-200"
              : isEnterEnabled
              ? "bg-violet-500 hover:bg-violet-600 text-white border-violet-400" 
              : "bg-violet-200 text-violet-400 border-violet-100"
          )}
        />
      </div>
    </div>
  );
}

export default memo(KeyBoard);
