'use client'

import KeyBoard from "@/components/key-board";
import fetchWords, { fetcher } from "@/lib/api";
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { cn, formatTime, generateRandomWords, getNegativeMessage, getPositiveMessage } from "@/lib/utils";
import { Minus, PartyPopper, Plus, RefreshCw } from "lucide-react";
import { ResultModal } from "@/components/result-modal";
import UseTimes from "@/components/use-times";
import ConfettiEffect from "@/components/confetti-effect";
import { GameGrid } from './game-grid';

const gridColMaps: Record<number, string> = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
}

export default function Games() {
    const [columns, setColumns] = useState(3); // 总列数
    const rows = 6; // 总行数
    const [totalCells, setTotalCells] = useState(18); // 总单元格数
    const [gridCol, setGridCol] = useState('grid-cols-3'); // 网格列数样式
    const [showControls, setShowControls] = useState(true); // 是否显示控制按钮
    const [showKeyboard, setShowKeyboard] = useState(false); // 是否显示键盘

    const [currentCell, setCurrentCell] = useState(-1); // 当前单元格
    const [word, setWord] = useState(''); // 目标单词
    const [gridContent, setGridContent] = useState<string[]>([]); // 网格内容
    const [isEnterEnabled, setIsEnterEnabled] = useState(false); // 是否启用提交
    const [matchResults, setMatchResults] = useState<string[]>([]); // 匹配结果
    const [invalidRows, setInvalidRows] = useState<Set<number>>(new Set());
    const [flippingRows, setFlippingRows] = useState<Set<number>>(new Set()); // 翻转的行
    const [noMatchLetters, setNoMatchLetters] = useState<string[]>([]); // 不匹配的字母
    const [dialogVisible, setDialogVisible] = useState(false); // 对话框是否可见
    const [dialogTitle, setDialogTitle] = useState(''); // 对话框标题
    const [dialogMessage, setDialogMessage] = useState(''); // 对话框消息
    const [cellMatchClasses, setCellMatchClasses] = useState<string[]>([]); // 单元格匹配类
    const [totalTime, setTotalTime] = useState(1); // 总时间

    const [gridWriteData, setGridWriteData] = useState<string[]>([]); // 网格写入数据

    const [isProcessingEnter, setIsProcessingEnter] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const isInitialMount = useRef(true);  // 添加这行来跟踪初始挂载

    const [hasFirstInput, setHasFirstInput] = useState(false);  // 添加这个状态来跟踪第一次输入

    const [isGameOver, setIsGameOver] = useState(false);

    const [showConfetti, setShowConfetti] = useState(false);

    // 包装的时间设置函数，用于调试
    const setTotalTimeWithLog = useCallback((newTime: number) => {
        console.log('Setting totalTime from', totalTime, 'to', newTime, 'Stack:', new Error().stack?.split('\n')[2]);
        setTotalTime(newTime);
    }, [totalTime]);

    const handleFetchWord = async (cell: number) => {
      if (isLoading) return;  // 如果正在加载，直接返回
      
      setIsLoading(true);
      try {
        const randomWords = await generateRandomWords(cell);
        // console.log('随机单词===>>>', randomWords);
        const result = randomWords[cell] || [];
        // console.log('result===>>>', result);
        let len = result.length;
        if (len > 0) {
            let word = result[Math.floor(Math.random() * len)];
            // console.log('word ===>>>', word);
            setWord(word?.toUpperCase() || '');
        }
      } finally {
        setIsLoading(false);
      }
    }

    // 只在列数变化时初始化网格和获取新单词
    useEffect(() => {
        if (columns > 0) {
            initGrid(rows, columns);
            setShowKeyboard(true);
            setCurrentCell(0);
            handleFetchWord(columns);  // 最后获取新单词
        }
    }, [columns]);

    const initGrid = (rows: number, columns: number) => {
        setTotalCells(columns * rows);
        const newGridCol = gridColMaps[columns] || 'grid-cols-3';
        setGridCol(newGridCol);
        setGridContent(new Array(columns * rows).fill(''));
    };

    // 重置游戏，需要获取新单词
    const handleReset = () => {
        setGridContent([]);
        setCurrentCell(-1);
        setCellMatchClasses([]);
        setMatchResults([]);
        setNoMatchLetters([]);
        setTotalTimeWithLog(1); // 只在重置游戏时重置时间
        initGrid(rows, columns);
        handleFetchWord(columns);  // 重置时获取新单词
    };

    // 开始新游戏，需要获取新单词
    const handleStartGame = () => {
        // 清除所有状态
        setGridContent(new Array(totalCells).fill(''));
        setCurrentCell(0);
        setIsEnterEnabled(false);
        setCellMatchClasses([]); // 确保完全清除匹配状态
        setMatchResults([]);
        setNoMatchLetters([]);
        setHasFirstInput(false);
        setShowKeyboard(true);
        setIsGameOver(false);
        setInvalidRows(new Set()); // 清除无效行状态
        setFlippingRows(new Set()); // 清除翻转状态
        setIsProcessingEnter(false); // 重置处理状态
        setTotalTimeWithLog(1); // 只在开始新游戏时重置时间
        
        // 最后获取新单词
        handleFetchWord(columns);
    };

    // 获取单词
    // const fetchWord = async () => {
    //   const randomWords = await useSWR('/api/words', fetcher);
    //   // console.log(randomWords);
    // }

    // 删除列
    const handleDecrease = () => {
        if (columns > 3) {
            // 先重置游戏状态
            setGridContent([]);
            setCellMatchClasses([]);
            setMatchResults([]);
            setNoMatchLetters([]);
            setHasFirstInput(false);
            setIsGameOver(false);
            setCurrentCell(-1);
            setTotalTimeWithLog(1); // 改变列数时重置时间
            // 再改变列数
            setColumns(prevColumns => prevColumns - 1);
        } else {
            toast.warning('Minimum columns reached');
        }
    };

    // 增加列
    const handleIncrease = () => {
        if (columns < 8) {
            // 先重置游戏状态
            setGridContent([]);
            setCellMatchClasses([]);
            setMatchResults([]);
            setNoMatchLetters([]);
            setHasFirstInput(false);
            setIsGameOver(false);
            setCurrentCell(-1);
            setTotalTimeWithLog(1); // 改变列数时重置时间
            // 再改变列数
            setColumns(prevColumns => prevColumns + 1);
        } else {
            toast.warning('Maximum columns reached');
        }
    };

    // 获取当前行
    const getCurrentRow = () => {
        // 如果光标隐藏，需要找到最后一个非空格子所在的行
        if (currentCell === -1) {
            for (let i = gridContent.length - 1; i >= 0; i--) {
                if (gridContent[i] !== '') {
                    return Math.floor(i / columns);
                }
            }
            return 0; // 如果没有找到非空格子，返回第一行
        }
        return Math.floor(currentCell / columns);
    }

    // 判断行是否填满
    const isRowFilled = (row: number) => {
        const startIndex = row * columns;
        const endIndex = startIndex + columns;
        const rowContent = gridContent.slice(startIndex, endIndex);
        return rowContent.every(cell => cell.trim() !== '');
    };

    // 获取当前行单词
    const getCurrentRowWord = () => {
        const currentRow = getCurrentRow();
        const startIndex = currentRow * columns;
        const endIndex = startIndex + columns;
        return gridContent.slice(startIndex, endIndex).join('');
    };

    // 检查单词是否有效
    const checkWord = async (word: string) => {
      try {
        // 首先进行基本验证
        if (!word || word.trim() === '') {
          console.warn('Empty word provided');
          return false;
        }
        
        if (!/^[a-zA-Z]+$/.test(word)) {
          console.warn('Word contains invalid characters');
          return false;
        }
        
        // 调用API验证
        const isValid = await fetchWords(word);
        return isValid;
      } catch (error) {
        console.error('Error validating word:', error);
        // 如果验证失败，返回false而不是抛出错误
        return false;
      }
    };

    // 匹配单词
    const matchWord = (guessedWord: string, targetWord: string) => {
        const matchWords: string[] = [];
        const targetLetters = [...targetWord];
        const guessedLetters = [...guessedWord];
        const matchStatus = new Array(guessedWord.length).fill('');

        // 第一步：标记完全匹配（绿色）
        for (let i = 0; i < guessedLetters.length; i++) {
            if (guessedLetters[i] === targetLetters[i]) {
                matchStatus[i] = 'C';
                matchWords.push(guessedLetters[i] || '');
                targetLetters[i] = '*';  // 标记已使用
                guessedLetters[i] = '#';  // 标记已匹配
            }
        }

        // 第二步：标记部分匹配（黄色）和不匹配（灰色）
        for (let i = 0; i < guessedLetters.length; i++) {
            if (guessedLetters[i] !== '#') {  // 跳过已完全匹配的字母
                const targetIndex = targetLetters.findIndex(letter => 
                    letter === guessedLetters[i] && letter !== '*'
                );
                
                if (targetIndex !== -1) {
                    matchStatus[i] = 'P';  // 部分匹配（黄色）
                    matchWords.push(guessedLetters[i] || '');
                    targetLetters[targetIndex] = '*';  // 标记该位置已使用
                } else {
                    matchStatus[i] = 'X';  // 不匹配（灰色）
                    if (!matchWords.includes(guessedLetters[i] || '')) {
                        setNoMatchLetters(prev => [...prev, guessedLetters[i] || '']);
                    }
                }
            }
        }

        setCellMatchClasses(prev => [...prev, ...matchStatus]);
        return matchWords;
    };

    // 提交单词
    const handleEnter = async () => {
        // 如果正在处理 enter，直接返回
        if (isProcessingEnter) {
            return;
        }

        const currentRow = getCurrentRow();
        const guessedWord = getCurrentRowWord().toLowerCase();
        const isCurrentRowFilled = isRowFilled(currentRow);

        if (isCurrentRowFilled) {
            setIsProcessingEnter(true);
            
            try {
                const isValid = await checkWord(guessedWord);
                if (isValid) {
                    const result = matchWord(guessedWord.toUpperCase(), word);
                    setMatchResults(result);
                    setFlippingRows(new Set([currentRow]));

                    setTimeout(() => {
                        setFlippingRows(new Set());
                        setIsProcessingEnter(false);

                        if (guessedWord.toUpperCase() === word) {
                            // 游戏胜利时记录当前时间
                            console.log('Game won! Current totalTime:', totalTime);
                            
                            setShowKeyboard(false);
                            setShowControls(true);
                            setDialogTitle('You Won!');
                            setDialogVisible(true);
                            setDialogMessage(getPositiveMessage() || '');
                            setCurrentCell(-1);
                            setIsGameOver(true);
                            setShowConfetti(true);  // 触发散花效果
                            
                            // 2秒后关闭散花效果
                            setTimeout(() => {
                                setShowConfetti(false);
                            }, 2000);
                        } else if (currentRow >= rows - 1) {
                            setShowKeyboard(false);
                            setShowControls(true);
                            setDialogTitle('You Lost!');
                            setDialogVisible(true);
                            setDialogMessage(getNegativeMessage() || '');
                            setIsGameOver(true);  // 设置游戏结束状态
                        } else {
                            setCurrentCell((currentRow + 1) * columns);
                        }
                    }, columns * 100);
                } else {
                    toast.error(`"${guessedWord.toUpperCase()}" is not a valid word`);
                    setInvalidRows(prev => new Set(prev).add(currentRow));
                    setIsProcessingEnter(false); // 处理完成
                }
            } catch (error) {
                console.error('Error during word submission:', error);
                setIsProcessingEnter(false); // 发生错误时也要重置状态
                toast.error('Network error - please check your connection and try again');
            }
        } else {
            toast.warning('Please fill in the row before submitting');
        }
    };

    // 使用 useCallback 优化回调函数
    const handleKeyPress = useCallback((letter: string) => {
        if (currentCell >= 0 && currentCell < totalCells) {
            if (!hasFirstInput) {
                setHasFirstInput(true);
            }

            const currentRow = Math.floor(currentCell / columns);
            const isRowEnd = (currentCell + 1) % columns === 0;
            const newGridContent = [...gridContent];
            
            if (isRowEnd && newGridContent[currentCell] !== '') {
                return;
            }
            
            newGridContent[currentCell] = letter;
            setGridContent(newGridContent);
            
            if (!isRowEnd) {
                setCurrentCell(prevCell => prevCell + 1);
            } else if (newGridContent[currentCell] === '') {
                setCurrentCell(currentCell);
            } else {
                setCurrentCell(-1);
            }

            setIsEnterEnabled(isRowFilled(currentRow));
            setInvalidRows(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentRow);
                return newSet;
            });
        }
    }, [currentCell, totalCells, columns, gridContent, hasFirstInput]);

    // 使用 useMemo 缓存计算结果
    const currentRow = useMemo(() => getCurrentRow(), [currentCell, columns, gridContent]);

    // 使用 useMemo 缓存控制栏组件
    const controlBar = useMemo(() => (
        <div className="flex items-center justify-center gap-3 h-10 mb-8">
            <div className="h-10 flex items-center">
                <button onClick={handleDecrease} 
                    className="h-10 w-10 flex items-center justify-center bg-violet-100 text-violet-600 rounded-l-lg hover:bg-violet-200 transition-colors disabled:opacity-50 disabled:hover:bg-violet-100"
                    disabled={columns <= 3}
                >
                    <Minus className="w-4 h-4" />
                </button>
                <div className="h-10 min-w-[40px] flex items-center justify-center bg-white border-y border-violet-100 text-violet-700 font-medium">
                    {columns}
                </div>
                <button onClick={handleIncrease} 
                    className="h-10 w-10 flex items-center justify-center bg-violet-100 text-violet-600 rounded-r-lg hover:bg-violet-200 transition-colors disabled:opacity-50 disabled:hover:bg-violet-100"
                    disabled={columns >= 8}
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {hasFirstInput && (
                <div className="h-10 flex items-center px-4 bg-white/80 backdrop-blur rounded-lg shadow-sm border border-violet-100">
                    <UseTimes 
                        showKeyboard={showKeyboard} 
                        hasFirstInput={hasFirstInput}
                        isGameOver={isGameOver}
                        onTimeChange={setTotalTimeWithLog} 
                    />
                </div>
            )}

            <button 
                onClick={handleStartGame}
                className="h-10 w-10 flex items-center justify-center bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-200 transition-colors group"
            >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
        </div>
    ), [columns, hasFirstInput, showKeyboard, isGameOver]);

    // 使用 useCallback 优化事件处理函数
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!showKeyboard) return;
        
        const key = event.key;
        
        if (key === 'Enter') {
            event.preventDefault();
            if (!isProcessingEnter) {
                handleEnter();
            }
            return;
        }
        
        if (currentCell >= 0 && currentCell < totalCells) {
            if (/^[A-Z]$/.test(key.toUpperCase())) {
                handleKeyPress(key.toUpperCase());
            } else if (key === 'Backspace') {
                event.preventDefault();
                handleDelete();
            }
        } else if (key === 'Backspace' && currentCell === -1) {
            event.preventDefault();
            handleDelete();
        }
    }, [showKeyboard, currentCell, totalCells, isProcessingEnter]);

    // 删除单元格
    const handleDelete = () => {
        // 如果光标隐藏（-1），需要计算当前行
        if (currentCell === -1) {
            // 找到最后一个非空格子所在的行
            for (let i = gridContent.length - 1; i >= 0; i--) {
                if (gridContent[i] !== '') {
                    const row = Math.floor(i / columns);
                    const rowEnd = (row + 1) * columns - 1;
                    const newGridContent = [...gridContent];
                    newGridContent[rowEnd] = ''; // 清除该行最后一个格子的值
                    setGridContent(newGridContent);
                    setCurrentCell(rowEnd); // 设置光标到该行最后一个格子
                    break;
                }
            }
            return;
        }

        if (currentCell > 0) {
            const currentRow = Math.floor(currentCell / columns);
            const currentRowStart = currentRow * columns;
            
            // 如果当前位置在行首，不执行删除操作
            if (currentCell === currentRowStart) {
                return;
            }

            const newGridContent = [...gridContent];
            if (newGridContent[currentCell] !== '') {
                // 如果当前格子有内容，删除当前格子的内容
                newGridContent[currentCell] = '';
                setGridContent(newGridContent);
                // 不移动光标
            } else {
                // 如果当前格子为空，删除前一个格子的内容并移动光标
                // 确保不会跨行删除
                const targetCell = currentCell - 1;
                if (Math.floor(targetCell / columns) === currentRow) {
                    newGridContent[targetCell] = '';
                    setGridContent(newGridContent);
                    setCurrentCell(targetCell);
                }
            }

            // 清除当前行的无效状态
            setInvalidRows(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentRow);
                return newSet;
            });
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        // console.log('add event');
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]); // 使用handleKeyDown作为依赖项

    return (
        <>
            <ConfettiEffect isActive={showConfetti} />
            <div className="relative z-0">  {/* 添加相对定位和较低的 z-index */}
            <div className="container mx-auto max-w-screen-md min-h-[600px] flex flex-col">
                {/* 游戏区域 - 使用固定高度和padding来保持稳定 */}
                <div className="flex-1 flex flex-col items-center py-8">
                {/* 游戏内容区域 - 添加固定高度 */}
                <div className="h-[600px] flex flex-col items-center">
                    {gridContent.length > 0 ? (    
                    <>
                        {controlBar}
                        <GameGrid 
                            gridContent={gridContent}
                            columns={columns}
                            gridCol={gridCol}
                            currentCell={currentCell}
                            invalidRows={invalidRows}
                            flippingRows={flippingRows}
                            cellMatchClasses={cellMatchClasses}
                        />
                        {showKeyboard && (
                        <div className="mt-auto">
                            <KeyBoard 
                            onKeyPress={handleKeyPress} 
                            onDelete={handleDelete} 
                            onEnter={handleEnter} 
                            matchedLetters={matchResults} 
                            isEnterEnabled={isEnterEnabled}
                            noMatchLetters={noMatchLetters}
                            />
                        </div>
                        )}
                    </>
                    ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative">
                        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-loading"></div>
                        <span className="absolute top-14 left-1/2 -translate-x-1/2 text-violet-500">Loading...</span>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>
            </div>

            <ResultModal
            isOpen={dialogVisible}
            onClose={() => {
                setDialogVisible(false);
                // 清除所有游戏状态
                setGridContent(new Array(totalCells).fill(''));
                setCurrentCell(0);
                setIsEnterEnabled(false);
                setCellMatchClasses([]);
                setMatchResults([]);
                setNoMatchLetters([]);
                setHasFirstInput(false);
                setShowKeyboard(true);
                setIsGameOver(false);
                setInvalidRows(new Set());
                setFlippingRows(new Set());
                setIsProcessingEnter(false);
                // 获取新单词
                handleFetchWord(columns);
            }}
            onNewGame={() => {
                setDialogVisible(false);
                handleStartGame();
            }}
            title={dialogTitle || 'You Won!'}
            description={dialogMessage}
            titleClassName="text-center text-2xl border-b-2 border-violet-100 py-2"
            >
            <div className="flex flex-col items-center border-b-2 border-violet-100 pb-5">
                {
                dialogTitle === 'You Lost!' ? ( 
                    <>
                    <label className="text-lg leading-6 text-zinc-700 mt-5">The word was</label>
                    <h1 className="text-4xl font-bold my-5 bg-gradient-to-r from-zinc-800 to-violet-500 bg-clip-text text-transparent">
                        {word?.toUpperCase()}
                    </h1>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                    <PartyPopper className="w-12 h-12 text-violet-500" />
                    <p className="mt-4 text-zinc-700 text-lg font-medium">Congratulations!</p>
                    <div className="mt-2 px-4 py-2 bg-violet-50 rounded-lg">
                        <p className="text-violet-600">
                        You've guessed the word in <span className="font-semibold">{formatTime(totalTime)}</span>
                        </p>
                        {/* 调试信息 */}
                        {/* <div className="text-xs text-gray-400 mt-1">
                            Debug: totalTime = {totalTime}
                        </div> */}
                    </div>
                    </div>
                )
                }
            </div>
            </ResultModal>
        </>
    )
}