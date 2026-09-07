'use client'

import { useSearchParams } from 'next/navigation';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { RuntimeGameModeConfig } from "@/server/game-modes";
import {
  fetchDailyChallengeRecord,
  fetchDailyWord,
  saveDailyChallengeRecord,
  fetchUnlimitedWord,
  submitDailyGuess,
  validateWord,
  type DailyWordResponse,
} from "@/lib/api";
import { LEXICON_PROFILE_KEYS } from "@/lib/lexicon-profile-keys";
import { useAuthSession } from "@/hooks/use-auth-session";
import { refreshDailyChallengeProgress } from "@/hooks/use-daily-challenge-progress";
import {
  applyRowResultToCellStates,
  createEmptyCellStates,
  evaluateGuess,
  updateKeyboardLetterStates,
  type CellState,
  type EvaluatedLetterState,
  type KeyboardLetterStateMap,
} from "@/lib/game-state";
import {
  generateEmojiPattern,
  getNegativeMessage,
  getPositiveMessage,
} from "@/lib/utils";
import { DEFAULT_UNLIMITED_WORD_LENGTH } from "@/lib/unlimited-word-config";
import type {
  DailyChallengeCommunityStats,
  DailyChallengeRecord,
  DailyChallengeSession,
} from "@/types/auth";

export type GameMode = 'daily' | 'unlimited';

export type GameResultData = {
  isWin: boolean;
  attempts: number;
  maxAttempts: number;
  word: string;
  totalTime: number;
  wordLength: number;
  pattern?: string;
  communityStats?: DailyChallengeCommunityStats | null;
  isCommunityStatsLoading?: boolean;
};

export type DailyRecordSaveState =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'requires-auth'
  | 'error';

type DailyLocalProgressSnapshot = {
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  completed: boolean;
  completionToken: string | null;
  guesses: string[];
  isWin: boolean | null;
  pattern?: string;
  progressToken: string | null;
  rowResults: EvaluatedLetterState[][];
  solutionWord: string | null;
  totalTime: number;
  wordLength: number;
};

type DeletingCellSnapshot = {
  content: string;
  state: CellState;
};

function getStatusMessage({
  hasFirstInput,
  isCurrentRowReady,
  isGameOver,
  isLoadingWord,
  isProcessingEnter,
  remainingLetters,
}: {
  hasFirstInput: boolean;
  isCurrentRowReady: boolean;
  isGameOver: boolean;
  isLoadingWord: boolean;
  isProcessingEnter: boolean;
  remainingLetters: number;
}) {
  if (isLoadingWord) {
    return 'Preparing the next word...';
  }

  if (isProcessingEnter) {
    return 'Checking your guess...';
  }

  if (isGameOver) {
    return 'Round complete';
  }

  if (isCurrentRowReady) {
    return 'Press Enter to submit';
  }

  if (!hasFirstInput) {
    return 'Start typing to begin';
  }

  if (remainingLetters === 1) {
    return 'Add 1 more letter';
  }

  return `Add ${remainingLetters} more letters`;
}

function createEmptyGrid(totalCells: number): string[] {
  return Array.from({ length: totalCells }, () => '');
}

function clearTimeoutIfNeeded(timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
}

function getDailyLocalProgressSnapshotKey(
  challengeDate: string,
  challengeVersion: string,
) {
  return `wordless-daily-progress:${challengeVersion}:${challengeDate}`;
}

function readDailyLocalProgressSnapshot(
  challengeDate: string,
  challengeVersion: string,
) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(
      getDailyLocalProgressSnapshotKey(challengeDate, challengeVersion),
    );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as DailyLocalProgressSnapshot;
  } catch (error) {
    console.error('read daily local progress snapshot error:', error);
    return null;
  }
}

function writeDailyLocalProgressSnapshot(snapshot: DailyLocalProgressSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      getDailyLocalProgressSnapshotKey(snapshot.challengeDate, snapshot.challengeVersion),
      JSON.stringify(snapshot),
    );
  } catch (error) {
    console.error('write daily local progress snapshot error:', error);
  }
}

function clearDailyLocalProgressSnapshot(
  challengeDate: string,
  challengeVersion: string,
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(
    getDailyLocalProgressSnapshotKey(challengeDate, challengeVersion),
  );
}

export function useWordlessGame({
  initialDailyConfig,
  initialUnlimitedConfig,
}: {
  initialDailyConfig: RuntimeGameModeConfig;
  initialUnlimitedConfig: RuntimeGameModeConfig;
}) {
  const {
    isLoading: isAuthLoading,
  } = useAuthSession();
  const searchParams = useSearchParams();
  const requestedGameMode: GameMode =
    searchParams.get('mode') === 'classic' || searchParams.get('mode') === 'unlimited'
      ? 'unlimited'
      : 'daily';

  const [gameMode, setGameMode] = useState<GameMode>(requestedGameMode);
  const dailyWordLength = initialDailyConfig.defaultWordLength;
  const unlimitedEnabledLengths = initialUnlimitedConfig.lengths
    .filter((length) => length.enabled)
    .map((length) => length.wordLength)
    .sort((left, right) => left - right);
  const initialUnlimitedLength =
    initialUnlimitedConfig.defaultWordLength ?? DEFAULT_UNLIMITED_WORD_LENGTH;
  const [unlimitedColumns, setUnlimitedColumns] = useState(initialUnlimitedLength);
  const [columns, setColumns] = useState(
    requestedGameMode === 'daily'
      ? initialDailyConfig.defaultWordLength
      : initialUnlimitedLength
  );
  const rows = 6;
  const totalCells = rows * columns;

  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showActiveCellHighlight, setShowActiveCellHighlight] = useState(false);
  const [currentCell, setCurrentCell] = useState(-1);
  const [word, setWord] = useState('');
  const [gridContent, setGridContent] = useState<string[]>([]);
  const [cellStates, setCellStates] = useState<CellState[]>([]);
  const [keyboardLetterStates, setKeyboardLetterStates] =
    useState<KeyboardLetterStateMap>({});
  const [invalidRows, setInvalidRows] = useState<Set<number>>(new Set());
  const [flippingRows, setFlippingRows] = useState<Set<number>>(new Set());
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [totalTime, setTotalTime] = useState(0);
  const [isProcessingEnter, setIsProcessingEnter] = useState(false);
  const [hasFirstInput, setHasFirstInput] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [activeKeyboardKey, setActiveKeyboardKey] = useState<string | null>(null);
  const [poppingCells, setPoppingCells] = useState<Set<number>>(new Set());
  const [deletingCells, setDeletingCells] = useState<Map<number, DeletingCellSnapshot>>(
    new Map()
  );
  const [dailyChallenge, setDailyChallenge] = useState<DailyWordResponse | null>(
    null
  );
  const [dailySession, setDailySession] = useState<DailyChallengeSession | null>(
    null
  );
  const [gameResultData, setGameResultData] = useState<GameResultData | null>(
    null
  );
  const [dailyRecordSaveState, setDailyRecordSaveState] =
    useState<DailyRecordSaveState>('idle');
  const [canRetryDailyRecordSave, setCanRetryDailyRecordSave] = useState(false);

  const handleEnterRef = useRef<() => void>(() => undefined);
  const handleDeleteRef = useRef<() => void>(() => undefined);
  const fetchWordRequestIdRef = useRef(0);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cellPopTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const cellDeleteTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const gameSessionIdRef = useRef(0);
  const dailyGuessValidationCacheRef = useRef<Map<string, Promise<boolean>>>(
    new Map()
  );
  const dailyProgressTokenRef = useRef<string | null>(null);

  const clearCellPopTimeouts = useCallback(() => {
    cellPopTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    cellPopTimeoutsRef.current.clear();
  }, []);

  const clearCellDeleteTimeouts = useCallback(() => {
    cellDeleteTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    cellDeleteTimeoutsRef.current.clear();
  }, []);

  const clearCellDelete = useCallback((cellIndex: number) => {
    const existingTimeout = cellDeleteTimeoutsRef.current.get(cellIndex);

    if (existingTimeout) {
      clearTimeout(existingTimeout);
      cellDeleteTimeoutsRef.current.delete(cellIndex);
    }

    setDeletingCells((prev) => {
      if (!prev.has(cellIndex)) {
        return prev;
      }

      const next = new Map(prev);
      next.delete(cellIndex);
      return next;
    });
  }, []);

  const flashKeyboardKey = useCallback((key: string) => {
    clearTimeoutIfNeeded(keyboardFlashTimeoutRef);
    setActiveKeyboardKey(key);
    keyboardFlashTimeoutRef.current = setTimeout(() => {
      keyboardFlashTimeoutRef.current = null;
      setActiveKeyboardKey(null);
    }, 140);
  }, []);

  const popCell = useCallback(
    (cellIndex: number) => {
      const existingTimeout = cellPopTimeoutsRef.current.get(cellIndex);

      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      setPoppingCells((prev) => {
        const next = new Set(prev);
        next.add(cellIndex);
        return next;
      });

      const timeoutId = setTimeout(() => {
        cellPopTimeoutsRef.current.delete(cellIndex);
        setPoppingCells((prev) => {
          const next = new Set(prev);
          next.delete(cellIndex);
          return next;
        });
      }, 180);

      cellPopTimeoutsRef.current.set(cellIndex, timeoutId);
    },
    []
  );

  const animateCellDelete = useCallback(
    (cellIndex: number, snapshot: DeletingCellSnapshot) => {
      const existingTimeout = cellDeleteTimeoutsRef.current.get(cellIndex);

      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      setDeletingCells((prev) => {
        const next = new Map(prev);
        next.set(cellIndex, snapshot);
        return next;
      });

      const timeoutId = setTimeout(() => {
        cellDeleteTimeoutsRef.current.delete(cellIndex);
        setDeletingCells((prev) => {
          if (!prev.has(cellIndex)) {
            return prev;
          }

          const next = new Map(prev);
          next.delete(cellIndex);
          return next;
        });
      }, 160);

      cellDeleteTimeoutsRef.current.set(cellIndex, timeoutId);
    },
    []
  );

  const cancelPendingEffects = useCallback(() => {
    clearTimeoutIfNeeded(settleTimeoutRef);
    clearTimeoutIfNeeded(confettiTimeoutRef);
    clearTimeoutIfNeeded(keyboardFlashTimeoutRef);
    clearCellPopTimeouts();
    clearCellDeleteTimeouts();
    setFlippingRows(new Set());
    setPoppingCells(new Set());
    setDeletingCells(new Map());
    setActiveKeyboardKey(null);
    setShowConfetti(false);
    setIsProcessingEnter(false);
  }, [clearCellDeleteTimeouts, clearCellPopTimeouts]);

  const invalidateActiveSession = useCallback(() => {
    gameSessionIdRef.current += 1;
    cancelPendingEffects();
  }, [cancelPendingEffects]);

  const handleTotalTimeChange = useCallback((newTime: number) => {
    setTotalTime(newTime);
  }, []);

  const resetBoardState = useCallback(
    (nextColumns: number) => {
      const nextTotalCells = rows * nextColumns;
      invalidateActiveSession();

      setGridContent(createEmptyGrid(nextTotalCells));
      setCellStates(createEmptyCellStates(nextTotalCells));
      setKeyboardLetterStates({});
      setCurrentCell(0);
      setShowActiveCellHighlight(false);
      setShowKeyboard(true);
      setHasFirstInput(false);
      setIsGameOver(false);
      setInvalidRows(new Set());
      setDailySession(null);
      dailyProgressTokenRef.current = null;
      setDailyRecordSaveState('idle');
      setCanRetryDailyRecordSave(false);
      handleTotalTimeChange(0);
    },
    [handleTotalTimeChange, invalidateActiveSession, rows]
  );

  const handleFetchWord = useCallback(
    async (cellCount: number) => {
      const requestId = fetchWordRequestIdRef.current + 1;
      fetchWordRequestIdRef.current = requestId;
      setIsLoadingWord(true);
      setWord('');

      try {
        if (gameMode === 'daily') {
          const dailyWord = await fetchDailyWord();

          if (fetchWordRequestIdRef.current !== requestId) {
            return;
          }

          setDailyChallenge(dailyWord);
          setWord('');
          setIsLoadingWord(false);
          return;
        }

        const unlimitedWord = await fetchUnlimitedWord(cellCount);
        const randomWord = unlimitedWord.word.toUpperCase();

        if (fetchWordRequestIdRef.current !== requestId) {
          return;
        }

        setDailyChallenge(null);
        setWord(randomWord);
        setIsLoadingWord(false);
      } catch (error) {
        console.error('Error loading target word:', error);

        if (fetchWordRequestIdRef.current !== requestId) {
          return;
        }

        if (gameMode === 'daily') {
          toast.error(
              'Daily challenge is temporarily unavailable. Please try again shortly.'
          );
            setWord('');
          setDailyChallenge(null);
          setIsLoadingWord(false);
        } else {
          setIsLoadingWord(false);
          toast.error('Failed to load a new word, please try again');
        }
      }
    },
    [gameMode]
  );

  const restoreDailySessionState = useCallback(
    (
      session: DailyChallengeSession,
      record: DailyChallengeRecord | null,
      communityStats: DailyChallengeCommunityStats | null,
      progressToken?: string | null,
        options?: {
          showResultDialog?: boolean;
        },
    ) => {
        const showResultDialog = options?.showResultDialog ?? false;
      const nextGridContent = createEmptyGrid(totalCells);
      let nextCellStates = createEmptyCellStates(totalCells);
      let nextKeyboardLetterStates: KeyboardLetterStateMap = {};

      session.guesses.forEach((guess, rowIndex) => {
        const rowStart = rowIndex * columns;

        guess.split('').forEach((letter, letterIndex) => {
          nextGridContent[rowStart + letterIndex] = letter;
        });

        const rowResult = session.rowResults[rowIndex] ?? [];
        nextCellStates = applyRowResultToCellStates(
          nextCellStates,
          rowIndex,
          columns,
          rowResult,
        );
        nextKeyboardLetterStates = updateKeyboardLetterStates(
          nextKeyboardLetterStates,
          guess,
          rowResult,
        );
      });

      setGridContent(nextGridContent);
      setCellStates(nextCellStates);
      setKeyboardLetterStates(nextKeyboardLetterStates);
      setInvalidRows(new Set());
      setShowActiveCellHighlight(false);
      setHasFirstInput(session.guesses.length > 0);
      setDailySession(session);
      dailyProgressTokenRef.current =
        session.completed ? null : progressToken ?? null;

      if (session.completed) {
        const solutionWord = record?.answerWord ?? session.solutionWord ?? '';
          const dialogTitle = session.isWin ? 'You Won!' : 'You Lost!';
          const dialogMessage = session.isWin
            ? getPositiveMessage() || ''
            : getNegativeMessage() || '';

        setWord(solutionWord);
        setCurrentCell(-1);
        setShowKeyboard(false);
        setIsGameOver(true);
          if (showResultDialog) {
            setDialogVisible(true);
          }
          setDialogTitle(dialogTitle);
          setDialogMessage(dialogMessage);
        setGameResultData({
          isWin: session.isWin === true,
          attempts: session.attemptCount,
          maxAttempts: rows,
          word: solutionWord,
          totalTime: record?.totalTime ?? session.totalTime,
          wordLength: columns,
          pattern: record?.pattern ?? undefined,
          communityStats,
          isCommunityStatsLoading: false,
        });
        handleTotalTimeChange(record?.totalTime ?? session.totalTime);
        setDailyRecordSaveState(record ? 'saved' : 'error');
        return;
      }

      handleTotalTimeChange(session.totalTime);
      setWord('');
      setCurrentCell(Math.min(session.attemptCount * columns, totalCells - 1));
      setShowKeyboard(true);
      setIsGameOver(false);
      setDialogVisible(false);
      setDialogTitle('');
      setDialogMessage('');
      setGameResultData(null);
      setDailyRecordSaveState('idle');
    },
    [columns, handleTotalTimeChange, rows, totalCells]
  );

  const retryPendingDailyRecordSave = useCallback(
    async (options?: {
      expectedSessionId?: number;
      snapshot?: DailyLocalProgressSnapshot | null;
    }) => {
      if (gameMode !== 'daily' || !dailyChallenge) {
        return false;
      }

      const expectedSessionId = options?.expectedSessionId;
      const isStaleSession = () =>
        expectedSessionId !== undefined &&
        gameSessionIdRef.current !== expectedSessionId;
      const snapshot =
        options?.snapshot ??
        readDailyLocalProgressSnapshot(dailyChallenge.date, dailyChallenge.version);

      if (!snapshot?.completed || !snapshot.completionToken) {
        setCanRetryDailyRecordSave(false);
        return false;
      }

      setCanRetryDailyRecordSave(true);
      setDailyRecordSaveState('saving');
      setGameResultData((previous) =>
        previous
          ? {
              ...previous,
              isCommunityStatsLoading: true,
            }
          : previous,
      );

      try {
        await saveDailyChallengeRecord({
          completionToken: snapshot.completionToken,
          pattern: snapshot.pattern,
        });

        if (isStaleSession()) {
          return true;
        }

        const refreshedProgress = await fetchDailyChallengeRecord(dailyChallenge.date, {
          timezone: dailyChallenge.timezone,
          version: dailyChallenge.version,
        });

        if (isStaleSession()) {
          return true;
        }

        clearDailyLocalProgressSnapshot(
          dailyChallenge.date,
          dailyChallenge.version,
        );
        setCanRetryDailyRecordSave(false);
        await refreshDailyChallengeProgress(
          dailyChallenge.date,
          refreshedProgress,
        );

        if (refreshedProgress.record) {
          restoreDailySessionState(
            refreshedProgress.session?.completed
              ? refreshedProgress.session
              : {
                  challengeDate: refreshedProgress.record.challengeDate,
                  challengeVersion: refreshedProgress.record.challengeVersion,
                  challengeSequence: refreshedProgress.record.challengeSequence,
                  wordLength: refreshedProgress.record.wordLength,
                  attemptCount: refreshedProgress.record.attempts,
                  totalTime: refreshedProgress.record.totalTime,
                  guesses: snapshot.guesses,
                  rowResults: snapshot.rowResults,
                  completed: true,
                  isWin: refreshedProgress.record.isWin,
                  solutionWord: refreshedProgress.record.answerWord,
                  updatedAt: refreshedProgress.record.updatedAt,
                },
            refreshedProgress.record,
            refreshedProgress.communityStats,
              undefined,
              { showResultDialog: false },
          );
        } else {
          setDailyRecordSaveState('saved');
          setGameResultData((previous) =>
            previous
              ? {
                  ...previous,
                  communityStats: refreshedProgress.communityStats,
                  isCommunityStatsLoading: false,
                }
              : previous,
          );
        }

        return true;
      } catch (error) {
        if (isStaleSession()) {
          return false;
        }

        console.error('retry save daily local progress snapshot error:', error);
        setDailyRecordSaveState('error');
        setCanRetryDailyRecordSave(true);
        setGameResultData((previous) =>
          previous
            ? {
                ...previous,
                isCommunityStatsLoading: false,
              }
            : previous,
        );
        return false;
      }
    },
    [dailyChallenge, gameMode, restoreDailySessionState]
  );

  useEffect(() => {
    if (columns <= 0) {
      return;
    }

    resetBoardState(columns);
    void handleFetchWord(columns);
  }, [columns, handleFetchWord, resetBoardState]);

  useEffect(() => {
    return () => {
      clearTimeoutIfNeeded(settleTimeoutRef);
      clearTimeoutIfNeeded(confettiTimeoutRef);
      clearTimeoutIfNeeded(keyboardFlashTimeoutRef);
      clearCellPopTimeouts();
      clearCellDeleteTimeouts();
    };
  }, [clearCellDeleteTimeouts, clearCellPopTimeouts]);

  const applyGameMode = useCallback(
    (nextMode: GameMode) => {
      if (nextMode === gameMode) {
        return;
      }

      invalidateActiveSession();
      setDialogVisible(false);
      setGameResultData(null);
      setGameMode(nextMode);

      if (nextMode === 'daily') {
          setColumns(dailyWordLength);
        return;
      }

      setDailyChallenge(null);
      setDailySession(null);
      setColumns(unlimitedColumns);
    },
      [dailyWordLength, gameMode, invalidateActiveSession, unlimitedColumns]
  );

  useEffect(() => {
    applyGameMode(requestedGameMode);
  }, [applyGameMode, requestedGameMode]);

  useEffect(() => {
    if (gameMode !== 'daily' || !dailyChallenge || isAuthLoading) {
      return;
    }

      if (dailyChallenge.wordLength !== columns) {
        setColumns(dailyChallenge.wordLength);
        return;
      }

    let cancelled = false;

    void fetchDailyChallengeRecord(dailyChallenge.date, {
      timezone: dailyChallenge.timezone,
      version: dailyChallenge.version,
    })
      .then((progress) => {
        if (cancelled) {
          return;
        }

        if (progress.record) {
          clearDailyLocalProgressSnapshot(
            dailyChallenge.date,
            dailyChallenge.version,
          );
          setCanRetryDailyRecordSave(false);
          restoreDailySessionState(
            progress.session?.completed
              ? progress.session
              : {
                  challengeDate: progress.record.challengeDate,
                  challengeVersion: progress.record.challengeVersion,
                  challengeSequence: progress.record.challengeSequence,
                  wordLength: progress.record.wordLength,
                  attemptCount: progress.record.attempts,
                  totalTime: progress.record.totalTime,
                  guesses: [],
                  rowResults: [],
                  completed: true,
                  isWin: progress.record.isWin,
                  solutionWord: progress.record.answerWord,
                  updatedAt: progress.record.updatedAt,
                },
            progress.record,
            progress.communityStats,
              undefined,
              { showResultDialog: false },
          );
          return;
        }

        const localSnapshot = readDailyLocalProgressSnapshot(
          dailyChallenge.date,
          dailyChallenge.version,
        );

        if (localSnapshot) {
          setCanRetryDailyRecordSave(
            localSnapshot.completed && Boolean(localSnapshot.completionToken),
          );
          restoreDailySessionState(
            {
              challengeDate: localSnapshot.challengeDate,
              challengeVersion: localSnapshot.challengeVersion,
              challengeSequence: localSnapshot.challengeSequence,
              wordLength: localSnapshot.wordLength,
              attemptCount: localSnapshot.guesses.length,
              totalTime: localSnapshot.totalTime,
              guesses: localSnapshot.guesses,
              rowResults: localSnapshot.rowResults,
              completed: localSnapshot.completed,
              isWin: localSnapshot.isWin,
              solutionWord: localSnapshot.solutionWord,
              updatedAt: new Date().toISOString(),
            },
            null,
            progress.communityStats,
            localSnapshot.progressToken,
              { showResultDialog: false },
          );

          if (localSnapshot.completed && localSnapshot.completionToken) {
            void retryPendingDailyRecordSave({
              expectedSessionId: gameSessionIdRef.current,
              snapshot: localSnapshot,
            });
          }

          return;
        }

        if (progress.session?.completed) {
          setCanRetryDailyRecordSave(false);
          restoreDailySessionState(
            progress.session,
            progress.record,
            progress.communityStats,
              undefined,
              { showResultDialog: false },
          );
          return;
        }

        if (progress.session && !progress.session.completed) {
          console.warn(
            'Ignoring legacy daily challenge session without local progress token.',
          );
        }

        setDailySession(null);
        setDailyRecordSaveState('idle');
        setCanRetryDailyRecordSave(false);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error('load daily challenge progress error:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [
      columns,
    dailyChallenge,
    gameMode,
    isAuthLoading,
    isGameOver,
    retryPendingDailyRecordSave,
    restoreDailySessionState,
  ]);

  const handleStartGame = useCallback(() => {
    if (gameMode === 'daily' && dailySession) {
      if (dailySession.completed) {
        setDialogVisible(true);
        toast.message("You've already finished today's Daily Challenge.");
        return;
      }

      if (dailySession.attemptCount > 0) {
        toast.message("Continue today's Daily Challenge from where you left off.");
        return;
      }
    }

    setDialogVisible(false);
    setGameResultData(null);
    resetBoardState(columns);
    void handleFetchWord(columns);
  }, [
    columns,
    dailySession,
    gameMode,
    handleFetchWord,
    resetBoardState,
  ]);

  const handleDismissResultModal = useCallback(() => {
    setDialogVisible(false);
  }, []);

  const handleOpenResultModal = useCallback(() => {
    if (!gameResultData) {
      return;
    }

    setDialogVisible(true);
  }, [gameResultData]);

  const handleDecrease = useCallback(() => {
    const nextColumns = [...unlimitedEnabledLengths]
      .reverse()
      .find((length) => length < columns) ?? null;

    if (nextColumns === null) {
      toast.warning('No shorter word lengths available');
      return;
    }

    invalidateActiveSession();
    setUnlimitedColumns(nextColumns);
    setColumns(nextColumns);
  }, [columns, invalidateActiveSession, unlimitedEnabledLengths]);

  const handleIncrease = useCallback(() => {
    const nextColumns =
      unlimitedEnabledLengths.find((length) => length > columns) ?? null;

    if (nextColumns === null) {
      toast.warning('No longer word lengths available');
      return;
    }

    invalidateActiveSession();
    setUnlimitedColumns(nextColumns);
    setColumns(nextColumns);
  }, [columns, invalidateActiveSession, unlimitedEnabledLengths]);

  const getCurrentRow = useCallback(() => {
    if (currentCell === -1) {
      for (let index = gridContent.length - 1; index >= 0; index -= 1) {
        if (gridContent[index] !== '') {
          return Math.floor(index / columns);
        }
      }

      return 0;
    }

    return Math.floor(currentCell / columns);
  }, [columns, currentCell, gridContent]);

  const isRowFilled = useCallback(
    (row: number) => {
      const startIndex = row * columns;
      const endIndex = startIndex + columns;
      const rowContent = gridContent.slice(startIndex, endIndex);
      return rowContent.every((cell) => cell.trim() !== '');
    },
    [columns, gridContent]
  );

  const getCurrentRowWord = useCallback(() => {
    const currentRow = getCurrentRow();
    const startIndex = currentRow * columns;
    const endIndex = startIndex + columns;
    return gridContent.slice(startIndex, endIndex).join('');
  }, [columns, getCurrentRow, gridContent]);

  const checkWord = useCallback(async (nextWord: string) => {
    if (!nextWord || nextWord.trim() === '') {
      return false;
    }

    if (!/^[a-zA-Z]+$/.test(nextWord)) {
      return false;
    }

    return validateWord(nextWord, columns);
  }, [columns]);

  const getDailyGuessValidation = useCallback(
    (nextWord: string) => {
      const normalizedWord = nextWord.trim().toLowerCase();
      const cacheKey = [
        dailyChallenge?.date ?? "no-date",
        dailyChallenge?.version ?? "no-version",
        columns,
        normalizedWord,
      ].join(":");
      const cached = dailyGuessValidationCacheRef.current.get(cacheKey);

      if (cached) {
        return cached;
      }

      const validationPromise = validateWord(
        normalizedWord,
        columns,
        LEXICON_PROFILE_KEYS.DAILY_GUESS,
        {
          challengeDate: dailyChallenge?.date,
          challengeVersion: dailyChallenge?.version,
        },
      ).catch((error) => {
        dailyGuessValidationCacheRef.current.delete(cacheKey);
        throw error;
      });

      dailyGuessValidationCacheRef.current.set(cacheKey, validationPromise);
      return validationPromise;
    },
    [columns, dailyChallenge?.date, dailyChallenge?.version]
  );

  useEffect(() => {
    if (gameMode !== 'daily' || !dailyChallenge) {
      return;
    }

    const currentRow = getCurrentRow();

    if (!isRowFilled(currentRow)) {
      return;
    }

    const guessedWord = getCurrentRowWord().trim().toLowerCase();

    if (!guessedWord) {
      return;
    }

    void getDailyGuessValidation(guessedWord);
  }, [
    dailyChallenge,
    gameMode,
    getCurrentRow,
    getCurrentRowWord,
    getDailyGuessValidation,
    gridContent,
    isRowFilled,
  ]);

  const handleEnter = useCallback(async () => {
    flashKeyboardKey('Enter');

    const shouldUseServerDailyGuess =
      gameMode === 'daily' && dailyChallenge !== null;

    if (
      isProcessingEnter ||
      isLoadingWord ||
      (!shouldUseServerDailyGuess && !word)
    ) {
      if (isLoadingWord || (!shouldUseServerDailyGuess && !word)) {
        toast.message('The next word is still loading');
      }

      return;
    }

    const currentRow = getCurrentRow();
    const guessedWord = getCurrentRowWord().toLowerCase();
    const isCurrentRowFilled = isRowFilled(currentRow);

    if (!isCurrentRowFilled) {
      toast.warning('Please fill in the row before submitting');
      return;
    }

    setIsProcessingEnter(true);

    try {
      const normalizedGuess = guessedWord.toUpperCase();
      let resolvedGuess = normalizedGuess;
      let rowResult: EvaluatedLetterState[];
      let isWin = false;
      let revealedWord = '';
      let completionToken: string | null = null;
      let persistedSession: DailyChallengeSession | null = null;
      let communityStats: DailyChallengeCommunityStats | null = null;

      if (shouldUseServerDailyGuess) {
        const activeDailyChallenge = dailyChallenge;

        if (!activeDailyChallenge) {
          setIsProcessingEnter(false);
          toast.error("Couldn't load today's Daily Challenge.");
          return;
        }

        const isValid = await getDailyGuessValidation(guessedWord);

        if (!isValid) {
          toast.error(`"${guessedWord.toUpperCase()}" is not a valid word`);
          setInvalidRows((prev) => new Set(prev).add(currentRow));
          setIsProcessingEnter(false);
          return;
        }

        const result = await submitDailyGuess({
          challengeDate: activeDailyChallenge.date,
          challengeToken: activeDailyChallenge.challengeToken,
          challengeVersion: activeDailyChallenge.version,
          guess: guessedWord,
          progressToken: dailyProgressTokenRef.current ?? undefined,
          totalTime,
          timezone: activeDailyChallenge.timezone,
        });

        if (!result.valid || !result.rowResult) {
          toast.error(`"${guessedWord.toUpperCase()}" is not a valid word`);
          setInvalidRows((prev) => new Set(prev).add(currentRow));
          setIsProcessingEnter(false);
          return;
        }

        resolvedGuess = result.guess;
        rowResult = result.rowResult;
        isWin = result.isWin === true;
        revealedWord = result.solutionWord?.toUpperCase() ?? '';
        completionToken = result.completionToken ?? null;
        dailyProgressTokenRef.current = result.progressToken ?? null;
        persistedSession = result.session ?? null;
        communityStats = result.communityStats ?? null;
        setDailySession(persistedSession);
      } else {
        const isValid = await checkWord(guessedWord);

        if (!isValid) {
          toast.error(`"${guessedWord.toUpperCase()}" is not a valid word`);
          setInvalidRows((prev) => new Set(prev).add(currentRow));
          setIsProcessingEnter(false);
          return;
        }

        rowResult = evaluateGuess(normalizedGuess, word);
        isWin = normalizedGuess === word;
        revealedWord = isWin || currentRow >= rows - 1 ? word : '';
      }

      const nextCellStates = applyRowResultToCellStates(
        cellStates,
        currentRow,
        columns,
        rowResult
      );
      const nextKeyboardLetterStates = updateKeyboardLetterStates(
        keyboardLetterStates,
        resolvedGuess,
        rowResult
      );
      const previousDailyGuesses = Array.from({ length: currentRow }, (_, rowIndex) =>
        gridContent.slice(rowIndex * columns, (rowIndex + 1) * columns).join('').toUpperCase()
      );
      const previousDailyRowResults = Array.from({ length: currentRow }, (_, rowIndex) =>
        cellStates
          .slice(rowIndex * columns, (rowIndex + 1) * columns)
          .map((state) => (state === 'correct' || state === 'present' || state === 'absent'
            ? state
            : 'absent')) as EvaluatedLetterState[]
      );
      const nextDailyGuesses = [...previousDailyGuesses, resolvedGuess];
      const nextDailyRowResults = [...previousDailyRowResults, rowResult];
      const sessionId = gameSessionIdRef.current;
      const activeDailyChallengeDate =
        shouldUseServerDailyGuess && dailyChallenge ? dailyChallenge.date : null;
      const activeDailyChallengeVersion =
        shouldUseServerDailyGuess && dailyChallenge ? dailyChallenge.version : undefined;
      const activeDailyChallengeSequence =
        shouldUseServerDailyGuess && dailyChallenge ? dailyChallenge.sequence : null;

      setCellStates(nextCellStates);
      setKeyboardLetterStates(nextKeyboardLetterStates);
      setFlippingRows(new Set([currentRow]));

      clearTimeoutIfNeeded(settleTimeoutRef);
      settleTimeoutRef.current = setTimeout(() => {
        if (gameSessionIdRef.current !== sessionId) {
          return;
        }

        settleTimeoutRef.current = null;
        setFlippingRows(new Set());
        setIsProcessingEnter(false);

        const completedRows = currentRow + 1;
        const emojiPattern = generateEmojiPattern(
          gridContent,
          nextCellStates,
          columns,
          isWin ? completedRows : rows
        );

        if (isWin) {
          if (revealedWord) {
            setWord(revealedWord);
          }

          if (shouldUseServerDailyGuess) {
            setDailyRecordSaveState('idle');
            dailyProgressTokenRef.current = null;
          }

          setGameResultData({
            isWin: true,
            attempts: persistedSession?.attemptCount ?? completedRows,
            maxAttempts: rows,
            word: revealedWord,
            totalTime,
            wordLength: columns,
            pattern: emojiPattern,
            communityStats,
            isCommunityStatsLoading: shouldUseServerDailyGuess && !communityStats,
          });

          setShowKeyboard(false);
          setDialogTitle('You Won!');
          setDialogVisible(true);
          setDialogMessage(getPositiveMessage() || '');
          setCurrentCell(-1);
          setIsGameOver(true);
          setShowConfetti(true);

          if (shouldUseServerDailyGuess) {
            if (!completionToken) {
              console.error('missing daily completion token for completed challenge');
              setDailyRecordSaveState('error');
            } else {
              const completedSnapshot =
                activeDailyChallengeDate &&
                activeDailyChallengeVersion &&
                activeDailyChallengeSequence !== null
                  ? {
                      challengeDate: activeDailyChallengeDate,
                      challengeSequence: activeDailyChallengeSequence,
                      challengeVersion: activeDailyChallengeVersion,
                      completed: true,
                      completionToken,
                      guesses: nextDailyGuesses,
                      isWin: true,
                      pattern: emojiPattern,
                      progressToken: null,
                      rowResults: nextDailyRowResults,
                      solutionWord: revealedWord,
                      totalTime,
                      wordLength: columns,
                    }
                  : null;

              if (completedSnapshot) {
                writeDailyLocalProgressSnapshot(completedSnapshot);
                setCanRetryDailyRecordSave(true);
              }

              void retryPendingDailyRecordSave({
                expectedSessionId: sessionId,
                snapshot: completedSnapshot,
              });
            }
            }

          clearTimeoutIfNeeded(confettiTimeoutRef);
          confettiTimeoutRef.current = setTimeout(() => {
            if (gameSessionIdRef.current !== sessionId) {
              return;
            }

            confettiTimeoutRef.current = null;
            setShowConfetti(false);
          }, 2000);

          return;
        }

        if (currentRow >= rows - 1) {
          if (revealedWord) {
            setWord(revealedWord);
          }

          if (shouldUseServerDailyGuess) {
            setDailyRecordSaveState('idle');
            dailyProgressTokenRef.current = null;
          }

          setGameResultData({
            isWin: false,
            attempts: persistedSession?.attemptCount ?? rows,
            maxAttempts: rows,
            word: revealedWord,
            totalTime,
            wordLength: columns,
            pattern: emojiPattern,
            communityStats,
            isCommunityStatsLoading: shouldUseServerDailyGuess && !communityStats,
          });

          setShowKeyboard(false);
          setDialogTitle('You Lost!');
          setDialogVisible(true);
          setDialogMessage(getNegativeMessage() || '');
          setIsGameOver(true);

          if (shouldUseServerDailyGuess) {
            if (!completionToken) {
              console.error('missing daily completion token for completed challenge');
              setDailyRecordSaveState('error');
            } else {
              const completedSnapshot =
                activeDailyChallengeDate &&
                activeDailyChallengeVersion &&
                activeDailyChallengeSequence !== null
                  ? {
                      challengeDate: activeDailyChallengeDate,
                      challengeSequence: activeDailyChallengeSequence,
                      challengeVersion: activeDailyChallengeVersion,
                      completed: true,
                      completionToken,
                      guesses: nextDailyGuesses,
                      isWin: false,
                      pattern: emojiPattern,
                      progressToken: null,
                      rowResults: nextDailyRowResults,
                      solutionWord: revealedWord,
                      totalTime,
                      wordLength: columns,
                    }
                  : null;

              if (completedSnapshot) {
                writeDailyLocalProgressSnapshot(completedSnapshot);
                setCanRetryDailyRecordSave(true);
              }

              void retryPendingDailyRecordSave({
                expectedSessionId: sessionId,
                snapshot: completedSnapshot,
              });
            }
            }

          return;
        }

        if (shouldUseServerDailyGuess) {
          setDailyRecordSaveState('idle');
        }

        if (
          shouldUseServerDailyGuess &&
          activeDailyChallengeDate &&
          activeDailyChallengeVersion &&
          activeDailyChallengeSequence !== null
        ) {
          writeDailyLocalProgressSnapshot({
            challengeDate: activeDailyChallengeDate,
            challengeSequence: activeDailyChallengeSequence,
            challengeVersion: activeDailyChallengeVersion,
            completed: false,
            completionToken: null,
            guesses: nextDailyGuesses,
            isWin: null,
            progressToken: dailyProgressTokenRef.current,
            rowResults: nextDailyRowResults,
            solutionWord: null,
            totalTime,
            wordLength: columns,
          });
          setCanRetryDailyRecordSave(false);
        }

        setCurrentCell((currentRow + 1) * columns);
      }, columns * 100);

      if (
        shouldUseServerDailyGuess &&
        activeDailyChallengeDate &&
        !persistedSession?.completed
      ) {
        void refreshDailyChallengeProgress(activeDailyChallengeDate);
      }
    } catch (error) {
      console.error('Error during word submission:', error);
      setIsProcessingEnter(false);
      if (
        error instanceof Error &&
        error.message.includes('Please sign in')
      ) {
        setDailyRecordSaveState('requires-auth');
        toast.error("Please sign in to continue today's Daily Challenge.");
        return;
      }

      if (
        error instanceof Error &&
        error.message.includes('already complete')
      ) {
        toast.error("You've already finished today's Daily Challenge.");
        return;
      }

      toast.error('Network error - please check your connection and try again');
    }
  }, [
    cellStates,
    checkWord,
    columns,
    getCurrentRow,
    getCurrentRowWord,
    gridContent,
    flashKeyboardKey,
    isLoadingWord,
    isProcessingEnter,
    isRowFilled,
    keyboardLetterStates,
    rows,
    totalTime,
    word,
    gameMode,
    getDailyGuessValidation,
    dailyChallenge,
    retryPendingDailyRecordSave,
  ]);

  const handleKeyPress = useCallback(
    (letter: string) => {
      flashKeyboardKey(letter);

      if (isLoadingWord || isProcessingEnter) {
        return;
      }

      if (currentCell < 0 || currentCell >= totalCells) {
        return;
      }

      setShowActiveCellHighlight(true);

      if (!hasFirstInput) {
        setHasFirstInput(true);
      }

      const currentRow = Math.floor(currentCell / columns);
      const isRowEnd = (currentCell + 1) % columns === 0;
      const nextGridContent = [...gridContent];
      const nextCellStates = [...cellStates];

      if (isRowEnd && nextGridContent[currentCell] !== '') {
        return;
      }

      clearCellDelete(currentCell);
      nextGridContent[currentCell] = letter;
      nextCellStates[currentCell] = 'pending';

      setGridContent(nextGridContent);
      setCellStates(nextCellStates);
      popCell(currentCell);

      if (!isRowEnd) {
        setCurrentCell((prevCell) => prevCell + 1);
      } else {
        setCurrentCell(-1);
      }

      setInvalidRows((prev) => {
        const nextInvalidRows = new Set(prev);
        nextInvalidRows.delete(currentRow);
        return nextInvalidRows;
      });
    },
    [
      cellStates,
      columns,
      clearCellDelete,
      currentCell,
      flashKeyboardKey,
      gridContent,
      hasFirstInput,
      isLoadingWord,
      isProcessingEnter,
      popCell,
      totalCells,
    ]
  );

  const handleDelete = useCallback(() => {
    flashKeyboardKey('Del');

    if (isLoadingWord || isProcessingEnter) {
      return;
    }

    setShowActiveCellHighlight(true);

    if (currentCell === -1) {
      for (let index = gridContent.length - 1; index >= 0; index -= 1) {
        if (gridContent[index] !== '') {
          const row = Math.floor(index / columns);
          const rowEnd = (row + 1) * columns - 1;
          const nextGridContent = [...gridContent];
          const nextCellStates = [...cellStates];
          const deletedLetter = nextGridContent[rowEnd];
          const deletedCellState = nextCellStates[rowEnd] ?? 'empty';

          nextGridContent[rowEnd] = '';
          nextCellStates[rowEnd] = 'empty';

          setGridContent(nextGridContent);
          setCellStates(nextCellStates);
          animateCellDelete(rowEnd, {
            content: deletedLetter ?? '',
            state: deletedCellState,
          });
          setCurrentCell(rowEnd);
          return;
        }
      }

      return;
    }

    if (currentCell <= 0) {
      return;
    }

    const currentRow = Math.floor(currentCell / columns);
    const currentRowStart = currentRow * columns;

    if (currentCell === currentRowStart) {
      return;
    }

    const nextGridContent = [...gridContent];
    const nextCellStates = [...cellStates];

    if (nextGridContent[currentCell] !== '') {
      const deletedLetter = nextGridContent[currentCell];
      const deletedCellState = nextCellStates[currentCell] ?? 'empty';
      nextGridContent[currentCell] = '';
      nextCellStates[currentCell] = 'empty';
      setGridContent(nextGridContent);
      setCellStates(nextCellStates);
      animateCellDelete(currentCell, {
        content: deletedLetter ?? '',
        state: deletedCellState,
      });
    } else {
      const targetCell = currentCell - 1;

      if (Math.floor(targetCell / columns) === currentRow) {
        const deletedLetter = nextGridContent[targetCell];
        const deletedCellState = nextCellStates[targetCell] ?? 'empty';
        nextGridContent[targetCell] = '';
        nextCellStates[targetCell] = 'empty';
        setGridContent(nextGridContent);
        setCellStates(nextCellStates);
        animateCellDelete(targetCell, {
          content: deletedLetter ?? '',
          state: deletedCellState,
        });
        setCurrentCell(targetCell);
      }
    }

    setInvalidRows((prev) => {
      const nextInvalidRows = new Set(prev);
      nextInvalidRows.delete(currentRow);
      return nextInvalidRows;
    });
  }, [
    cellStates,
    columns,
    currentCell,
    animateCellDelete,
    flashKeyboardKey,
    gridContent,
    isLoadingWord,
    isProcessingEnter,
  ]);

  const currentRow = getCurrentRow();
  const currentRowStart = currentRow * columns;
  const currentRowLetters = gridContent
    .slice(currentRowStart, currentRowStart + columns)
    .filter((cell) => cell.trim() !== '').length;
  const remainingLetters = Math.max(columns - currentRowLetters, 0);
  const isCurrentRowReady = isRowFilled(currentRow);
  const isInteractionLocked = isLoadingWord || isProcessingEnter;
  const isEnterEnabled = isCurrentRowReady && !isInteractionLocked;
  const canDecreaseLength = unlimitedEnabledLengths.some((length) => length < columns);
  const canIncreaseLength = unlimitedEnabledLengths.some((length) => length > columns);
  const statusMessage = getStatusMessage({
    hasFirstInput,
    isCurrentRowReady,
    isGameOver,
    isLoadingWord,
    isProcessingEnter,
    remainingLetters,
  });

  handleEnterRef.current = () => {
    void handleEnter();
  };
  handleDeleteRef.current = handleDelete;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showKeyboard || isLoadingWord || isProcessingEnter) {
        return;
      }

      const key = event.key;

      if (key === 'Enter') {
        event.preventDefault();

        if (!isProcessingEnter) {
          handleEnterRef.current();
        }

        return;
      }

      if (currentCell >= 0 && currentCell < totalCells) {
        if (/^[A-Z]$/.test(key.toUpperCase())) {
          handleKeyPress(key.toUpperCase());
        } else if (key === 'Backspace') {
          event.preventDefault();
          handleDeleteRef.current();
        }
      } else if (key === 'Backspace' && currentCell === -1) {
        event.preventDefault();
        handleDeleteRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCell, handleKeyPress, isLoadingWord, isProcessingEnter, showKeyboard, totalCells]);

  return {
    columns,
    currentCell,
    currentRow,
    dailyChallenge,
    dailyRecordSaveState,
    canRetryDailyRecordSave,
    dialogMessage,
    dialogTitle,
    dialogVisible,
    gameMode,
    gameResultData,
    gridContent,
    hasFirstInput,
    invalidRows,
    activeKeyboardKey,
    canDecreaseLength,
    canIncreaseLength,
    deletingCells,
    isCurrentRowReady,
    isEnterEnabled,
    isGameOver,
    isInteractionLocked,
    isLoadingWord,
    isProcessingEnter,
    rows,
    showActiveCellHighlight,
    remainingLetters,
    showConfetti,
    showKeyboard,
    statusMessage,
    totalTime,
    word,
    cellStates,
    flippingRows,
    keyboardLetterStates,
    poppingCells,
    handleDecrease,
    handleDelete,
    handleDismissResultModal,
    handleOpenResultModal,
    handleEnter,
    handleIncrease,
    handleKeyPress,
    retryPendingDailyRecordSave,
    handleStartGame,
    handleTotalTimeChange,
  };
}
