export type EvaluatedLetterState = 'correct' | 'present' | 'absent';

export type CellState = 'empty' | 'pending' | EvaluatedLetterState;

export type KeyboardLetterState = 'unused' | EvaluatedLetterState;

export type KeyboardLetterStateMap = Partial<Record<string, EvaluatedLetterState>>;

const keyboardStatePriority: Record<KeyboardLetterState, number> = {
  unused: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

export function createEmptyCellStates(totalCells: number): CellState[] {
  return Array.from({ length: totalCells }, () => 'empty');
}

export function evaluateGuess(
  guessedWord: string,
  targetWord: string
): EvaluatedLetterState[] {
  const targetLetters = [...targetWord];
  const guessedLetters = [...guessedWord];
  const result: EvaluatedLetterState[] = Array.from(
    { length: guessedWord.length },
    () => 'absent'
  );

  for (let index = 0; index < guessedLetters.length; index += 1) {
    if (guessedLetters[index] === targetLetters[index]) {
      result[index] = 'correct';
      targetLetters[index] = '*';
      guessedLetters[index] = '#';
    }
  }

  for (let index = 0; index < guessedLetters.length; index += 1) {
    if (guessedLetters[index] === '#') {
      continue;
    }

    const targetIndex = targetLetters.findIndex(
      (letter) => letter === guessedLetters[index]
    );

    if (targetIndex !== -1) {
      result[index] = 'present';
      targetLetters[targetIndex] = '*';
    }
  }

  return result;
}

export function applyRowResultToCellStates(
  prevCellStates: CellState[],
  row: number,
  columns: number,
  rowResult: EvaluatedLetterState[]
): CellState[] {
  const nextCellStates = [...prevCellStates];
  const rowStart = row * columns;

  rowResult.forEach((state, index) => {
    nextCellStates[rowStart + index] = state;
  });

  return nextCellStates;
}

export function updateKeyboardLetterStates(
  prevKeyboardStates: KeyboardLetterStateMap,
  guessedWord: string,
  rowResult: EvaluatedLetterState[]
): KeyboardLetterStateMap {
  const nextKeyboardStates = { ...prevKeyboardStates };

  rowResult.forEach((state, index) => {
    const letter = guessedWord[index]?.toUpperCase();

    if (!letter) {
      return;
    }

    const currentState = nextKeyboardStates[letter] ?? 'unused';

    if (keyboardStatePriority[state] > keyboardStatePriority[currentState]) {
      nextKeyboardStates[letter] = state;
    }
  });

  return nextKeyboardStates;
}
