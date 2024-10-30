'use client'

import KeyBoard from "@/components/key-board";
import fetchWords, { fetcher } from "@/lib/api";
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { cn, formatTime, generateRandomWords, getNegativeMessage, getPositiveMessage } from "@/lib/utils";
import { Minus, PartyPopper, Plus } from "lucide-react";
import { ResultModal } from "@/components/result-modal";
import useSWR from 'swr';
import UseTimes from "@/components/use-times";

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

    const handleFetchWord = (cell: number) => {
      const randomWords = generateRandomWords();
      // debugger;
      // console.log(randomWords);
      const result = randomWords[cell] || [];
      let len = result.length;
      if (len > 0) {
        let word = result[Math.floor(Math.random() * len)];
        setWord(word?.toUpperCase() || '');
      }
    }
    // 获取单词
    useEffect(() => {
      handleFetchWord(columns);
    }, []);

    // 获取单词
    const fetchWord = async () => {
      const randomWords = await useSWR('/api/words', fetcher);
      // console.log(randomWords);
    }


    const initGrid = (rows: number, columns: number) => {
      setTotalCells(columns * rows);
      const newGridCol = gridColMaps[columns] || 'grid-cols-3';
      setGridCol(newGridCol);
      setGridContent(new Array(columns * rows).fill(''));
      handleFetchWord(columns);
      setTotalTime(1);
    }

    // 删除列
    const handleDecrease = () => {
      if (columns > 3) {
          setColumns(prevColumns => prevColumns - 1);
      } else {
          toast.warning('Minimum columns reached');
      }
    };

    // 增加列
    const handleIncrease = () => {
        if (columns < 8) {
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

    const handleReset = () => {
        // setColumns(columns);
        setGridContent([]);
        setCurrentCell(-1);
        setCellMatchClasses([]);
        initGrid(rows, columns);
    };

    // 开始游戏
    const handleStartGame = () => {
        setShowControls(false);
        setShowKeyboard(true);
        setCurrentCell(0);
        // setTimer(0);
        // setIsTimerRunning(true);
        setGridContent(new Array(totalCells).fill('')); // 确保初始化为空字符串
        setIsEnterEnabled(false); // 重置 Enter 按钮状态
        setCellMatchClasses([]);
        setMatchResults([]);
        setNoMatchLetters([]);
    };

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
      // console.log(en)
      // TODO 先查表， 验证单词的合法性
      const isValid = await fetchWords(word);
      // TODO 如果是合法的单词， 保存至库中
      return isValid;
    };

    // 匹配单词
    const matchWord = (guessedWord: string, targetWord: string) => {
        const matchWords: string[] = [];
        guessedWord.split('').forEach((letter, index) => {
          if (targetWord.includes(letter)) {
            matchWords.push(letter);
            setCellMatchClasses(prev => [...prev, targetWord[index] === letter ? 'C' : 'P']); // 正确
          } else {
            setNoMatchLetters(prev => [...prev, letter]);
            setCellMatchClasses(prev => [...prev, 'X']);
          }
        });
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
            setIsProcessingEnter(true); // 开始处理
            
            try {
                const isValid = await checkWord(guessedWord);
                if (isValid) {
                    const result = matchWord(guessedWord.toUpperCase(), word);
                    setMatchResults(result);
                    setFlippingRows(new Set([currentRow]));

                    // 在动画完成后再清除状态
                    setTimeout(() => {
                        setFlippingRows(new Set());
                        setIsProcessingEnter(false); // 处理完成

                        if (guessedWord.toUpperCase() === word) {
                            setShowKeyboard(false);
                            setShowControls(true);
                            setDialogTitle('You Won!');
                            setDialogVisible(true);
                            setDialogMessage(getPositiveMessage() || '');
                            setCurrentCell(-1);
                        } else {
                            // 移动到下一行
                            if (currentRow < rows - 1) {
                                setCurrentCell((currentRow + 1) * columns);
                            } else {
                                setShowKeyboard(false);
                                setShowControls(true);
                                setDialogTitle('You Lost!');
                                setDialogVisible(true);
                                setDialogMessage(getNegativeMessage() || '');
                            }
                        }
                    }, columns * 100);
                } else {
                    toast.error('Word not found');
                    setInvalidRows(prev => new Set(prev).add(currentRow));
                    setIsProcessingEnter(false); // 处理完成
                }
            } catch (error) {
                setIsProcessingEnter(false); // 发生错误时也要重置状态
                toast.error('An error occurred');
            }
        } else {
            toast.warning('Please fill in the row before submitting');
        }
    };

    const handleKeyPress = (letter: string) => {
        if (currentCell >= 0 && currentCell < totalCells) {
            const currentRow = Math.floor(currentCell / columns);
            const isRowEnd = (currentCell + 1) % columns === 0;
            const newGridContent = [...gridContent];
            
            // 如果是最后一格且已有内容，不接收新值
            if (isRowEnd && newGridContent[currentCell] !== '') {
                return;
            }
            
            newGridContent[currentCell] = letter;
            setGridContent([...newGridContent]);
            
            // 只有在不是行尾或行尾为空时才移动光标
            if (!isRowEnd) {
                setCurrentCell(prevCell => prevCell + 1);
            } else if (newGridContent[currentCell] === '') {
                // 如果是行尾且为空，允许输入
                setCurrentCell(currentCell);
            } else {
                // 如果是行尾且已输入，隐藏光标
                setCurrentCell(-1);
            }

            const isCurrentRowFilled = isRowFilled(currentRow);
            setIsEnterEnabled(isCurrentRowFilled);

            // 清除当前行的无效状态
            setInvalidRows(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentRow);
                return newSet;
            });
        }
    };

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
      if (columns > 0) {
        // setTotalCells(columns * rows);
        // const newGridCol = gridColMaps[columns] || 'grid-cols-3';
        // setGridCol(newGridCol);
        // setGridContent(new Array(columns * rows).fill(''));
        initGrid(rows, columns);
      }
    }, [columns]);


    // 处理键盘输入
    const handleKeyDown = (event: KeyboardEvent) => {
        if (showKeyboard) {
            const key = event.key;
            
            // 处理回车键，需要检查 isProcessingEnter
            if (event.key === 'Enter') {
                event.preventDefault();
                // 如果正在处理 enter，直接返回
                if (isProcessingEnter) {
                    return;
                }
                handleEnter();
                return;
            }
            
            // 其他按键操作需要检查 currentCell 是否有效
            if (currentCell >= 0 && currentCell < totalCells) {
                if (/^[A-Z]$/.test(key.toUpperCase())) {
                    handleKeyPress(key.toUpperCase());
                } else if (event.key === 'Backspace') {
                    event.preventDefault();
                    handleDelete();
                }
            } else if (event.key === 'Backspace' && currentCell === -1) {
                // 特殊处理：当光标隐藏时也允许删除操作
                event.preventDefault();
                handleDelete();
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        // console.log('add event');
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentCell, totalCells, isProcessingEnter]); // 添加 isProcessingEnter 到依赖项

    return (
      <>
        <div className="container mx-auto max-w-screen-md flex flex-1 flex-col items-center justify-center relative">
          <UseTimes 
            showKeyboard={showKeyboard} 
            onTimeChange={(time: number) => { setTotalTime(time); }} 
          />
          {
            gridContent.length > 0 ? (    
              <div className={`grid ${gridCol} gap-2`}>
                {gridContent.map((content, index) => {
                  const row = Math.floor(index / columns);
                  const col = index % columns;
                  const isInvalidRow = invalidRows.has(row);
                  const isFlipping = flippingRows.has(row);
                  const matchClass = cellMatchClasses[index] ? cellMatchClasses[index] : '';
                  return (
                    <div 
                      key={index} 
                      className={cn(`
                        w-14 h-14 
                        flex items-center justify-center 
                        text-2xl font-bold 
                        rounded-md 
                        transition-all duration-200
                        ${content ? 'border-2' : 'border border-violet-200/50'}
                        ${index === currentCell ? 'ring-2 ring-violet-400' : ''}
                        ${isInvalidRow && content ? 'border-red-400 text-red-500' : 'text-zinc-700'}
                        ${isFlipping ? 'animate-flip' : ''}`, 
                        matchClass === 'C' ? 'bg-green-500 text-white border-green-400' : 
                        matchClass === 'P' ? 'bg-yellow-500 text-white border-yellow-400' : 
                        matchClass === 'X' ? 'bg-zinc-400 text-white border-zinc-400' : 'bg-white',
                      )}
                      style={{
                        animationDelay: isFlipping ? `${col * 100}ms` : '0ms'
                      }}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-loading"></div>
                  <span className="absolute top-14 left-1/2 -translate-x-1/2 text-violet-500">Loading...</span>
                </div>
              </div>
            )
          }
          {showControls && (
            <div className="mt-5 flex justify-center space-x-4 h-[184px]">
              <button onClick={handleReset} 
                className="h-10 px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors">
                Reset
              </button>
              <button onClick={handleDecrease} 
                className="h-10 px-2 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors">
                <Minus className="w-5 h-5" />
              </button>
              <button onClick={handleIncrease} 
                className="h-10 px-2 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <button onClick={handleStartGame} 
                className="h-10 px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors">
                Start
              </button>
            </div>
          )}
          {showKeyboard && <KeyBoard 
            onKeyPress={handleKeyPress} 
            onDelete={handleDelete} 
            onEnter={handleEnter} 
            matchedLetters={matchResults} 
            isEnterEnabled={isEnterEnabled}
            noMatchLetters={noMatchLetters}
          />}
        </div>

        <ResultModal
          isOpen={dialogVisible}
          onClose={() => {
            setDialogVisible(false);
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
                  </div>
                </div>
              )
            }
          </div>
        </ResultModal>
      </>
    )
}