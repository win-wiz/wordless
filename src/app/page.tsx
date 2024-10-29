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

// console.log(words)
export default function HomePage() {
    
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
      const currentRow = Math.floor(currentCell / columns);
      return currentRow;
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
        return gridContent.slice(startIndex, endIndex).every(cell => cell.trim() !== '');
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
          // if (targetWord[index] === letter) { 
          //   setCellMatchClasses(prev => [...prev, 'C']); // 正确
          // } else if (targetWord.includes(letter)) {
          //   matchWords.push(letter);
          //   setCellMatchClasses(prev => [...prev, 'P']); // 部分正确
          // } else {
          //   setNoMatchLetters(prev => [...prev, letter]);
          //   setCellMatchClasses(prev => [...prev, 'X']);
          // }
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
        // const currentRow = Math.floor(currentCell / columns);
        const currentRow = getCurrentRow();
        const guessedWord = getCurrentRowWord().toLowerCase();
        const isCurrentRowFilled = isRowFilled(currentRow);

        if (isCurrentRowFilled) {
          const isValid = await checkWord(guessedWord);
          if (isValid) {
              const result = matchWord(guessedWord.toUpperCase(), word);
              // setMatchResults(prev => [...prev, result]);
              setMatchResults(result);
              // 触发翻转动画
              setFlippingRows(new Set([currentRow]));

              // 在动画完成清除翻转状态
              setTimeout(() => {
                  setFlippingRows(new Set());
              }, columns * 100); // 假设每个格子的动画持续300ms

              if (guessedWord.toUpperCase() === word) {
                  // 猜对了，游戏结束
                  // setIsTimerRunning(false);
                  setShowKeyboard(false);
                  setShowControls(true);
                  setDialogTitle('You Won!');
                  setDialogVisible(true);
                  setDialogMessage(getPositiveMessage() || '');
                  setCurrentCell(-1);
                  setDialogTitle('You Won!');
                  // setErrorMessage('恭喜你猜对了！');
              } else {
                  // 移动到下一行
                  if (currentRow < rows - 1) {
                      setCurrentCell((currentRow + 1) * columns);
                  } else {
                      // 如果是最后一行，游戏结束
                      // setIsTimerRunning(false);
                      setShowKeyboard(false);
                      setShowControls(true);
                      setDialogTitle('You Lost!');
                      setDialogVisible(true);
                      setDialogMessage(getNegativeMessage() || '');
                      // setErrorMessage(`游戏结束，正确单词是 ${word}`);
                      // toast.success(`Game over, the correct word is ${word}`);
                  }
              }
          } else {
              // 不是有效单词
              // setErrorMessage('不是有效的单词，请重试');
              // toast.error('不是有效的单词，请重试');
              toast.error('Word not found');
              setInvalidRows(prev => new Set(prev).add(currentRow));
          }
        } else {
            // setErrorMessage('请填完整行后再提交');
            // toast.error('请填完整行后再提交');
            toast.warning('Please fill in the row before submitting');
        }

        // setTimeout(() => setErrorMessage(''), 2000);
    };

    const handleKeyPress = (letter: string) => {
        if (currentCell >= 0 && currentCell < totalCells) {
            const newGridContent = [...gridContent];
            newGridContent[currentCell] = letter;
            setGridContent(newGridContent);
            
            const currentRow = Math.floor(currentCell / columns);
            const isRowEnd = (currentCell + 1) % columns === 0;
            
            if (!isRowEnd) {
                setCurrentCell(prevCell => prevCell + 1);
            }

            const isCurrentRowFilled = isRowFilled(currentRow);
            setIsEnterEnabled(isCurrentRowFilled);

            // 清除当前行的无效状态
            setInvalidRows(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentRow);
                return newSet;
            });

            // console.log(`Current row: ${currentRow}, Is filled: ${isCurrentRowFilled}, Current cell: ${currentCell}, Grid content: ${newGridContent.slice(currentRow * columns, (currentRow + 1) * columns).join(',')}`);
        }
    };

    // 删除单元格
    const handleDelete = () => {
        if (currentCell > 0) {
            const currentRow = Math.floor(currentCell / columns);
            const currentRowStart = currentRow * columns;  // 当前行的起始位置
            
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
        if (showKeyboard && currentCell >= 0 && currentCell < totalCells) {
            const key = event.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                handleKeyPress(key);
            } else if (event.key === 'Backspace') {
                event.preventDefault(); // 阻止默认行为
                handleDelete();
            } else if (event.key === 'Enter') {
                event.preventDefault(); // 阻止默认行为
                handleEnter();
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showKeyboard, currentCell, totalCells]); // 依赖项包括可能在handleKeyDown中使用的状态

    return (
      <>
        {/* <p className="absolute top-5 right-5 text-zinc-500 text-sm text-white">答案: {word}  total time: {formatTime(totalTime)}</p> */}
        <main className="flex flex-1 flex-col items-center justify-center text-white">
          {
            gridContent.length > 0 ? (    
              <div className={`grid ${gridCol} gap-2 h-[400px]`}>
                {gridContent.map((content, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                const isInvalidRow = invalidRows.has(row);
                const isFlipping = flippingRows.has(row);
                // console.log(cellMatchClasses);
                // debugger;
                const matchClass = cellMatchClasses[index] ? cellMatchClasses[index] : '';
                return (
                    <div 
                        key={index} 
                        className={cn(`
                            w-14 h-14 
                          bg-slate-300 
                            flex items-center justify-center 
                            text-2xl font-bold 
                            rounded-md 
                            ${index === currentCell ? 'ring-2 ring-blue-500' : ''}
                            ${isInvalidRow && content ? 'border-red-500 text-red-500' : 'text-black'}
                            ${isFlipping ? 'animate-flip' : ''}`, 
                            matchClass === 'C' ? 'bg-green-500' : 
                            matchClass === 'P' ? 'bg-yellow-500' : 
                            matchClass === 'X' ? 'bg-slate-500' : 'bg-slate-300'
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
                  <div className="w-12 h-12 border-4 border-zinc-200 border-t-blue-500 rounded-full animate-loading"></div>
                  <span className="absolute top-14 left-1/2 -translate-x-1/2 text-zinc-400">Loading...</span>
                </div>
              </div>
            )
          }
          {showControls && (
              <div className="mt-5 flex justify-center space-x-4">
                <button onClick={handleReset} className="px-4 py-2 bg-blue-500 text-white rounded">Reset</button>
                <button onClick={handleDecrease} className="px-2 py-2 bg-blue-500 text-white rounded"><Minus /></button>
                <button onClick={handleIncrease} className="px-2 py-2 bg-blue-500 text-white rounded"><Plus /></button>
                <button onClick={handleStartGame} className="px-4 py-2 bg-blue-500 text-white rounded">Start</button>
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
          <UseTimes showKeyboard={showKeyboard} onTimeChange={(time: number) => {
            // console.log(time);
            setTotalTime(time);
          }} />
        </main>

        <ResultModal
          isOpen={dialogVisible}
          onClose={() => {
            setDialogVisible(false);
            // handleReset();
          }}
          title={dialogTitle || 'You Won!'}
          description={dialogMessage}
          // titleClassName="bg-red-500"
          titleClassName="text-center text-2xl border-b-2 border-zinc-200 py-2"
        >
          <div className="flex flex-col items-center border-b-2 border-zinc-200 pb-5">
            {
              dialogTitle === 'You Lost!' ? ( 
                <>
                  <label className="text-lg leading-6 text-zinc-800 mt-5">The word was</label>
                  <h1 className="text-4xl font-bold my-5">{word?.toUpperCase()}</h1>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center ">
                  {/* <label className="text-lg leading-6 text-zinc-800 mt-5">The word was</label>
                  <h1 className="text-4xl font-bold my-5">{word?.toUpperCase()}</h1> */}
                  <PartyPopper className="w-10 h-10 text-orange-300" />
                  <p className="mt-2 text-zinc-500 text-lg"> Congratulations!  </p>
                  <p className=" text-base text-zinc-500">You've guessed the word in {formatTime(totalTime)}</p>
                </div>
              )
            }
          </div>
        </ResultModal>
      </>
    )
}
