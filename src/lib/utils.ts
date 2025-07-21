import { WORD_LISTS } from "@/data/word-lists";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const positiveMessages = [
  "Brilliant! You've cracked the code!",
  "Fantastic job! Your word skills are impressive!",
  "Wow! You're a word wizard!",
  "Amazing work! You've mastered this challenge!",
  "Incredible! Your vocabulary is top-notch!",
  "Outstanding! You've conquered the word!",
  "Superb! Your linguistic prowess shines!",
  "Excellent! You're a true wordsmith!",
  "Bravo! You've solved the puzzle with finesse!",
  "Spectacular! Your word game is on point!",
  "You're wordtastic!",
  "Letter perfect performance!",
  "You've got the write stuff!",
  "Spelling bee champion material right here!",
  "Words bow down to your might!",
  "You've left Webster's dictionary in awe!",
  "Even Shakespeare would be impressed!",
  "You're the Sherlock Holmes of words!",
  "Your word skills are out of this world!",
  "You've just won a gold medal in wordplay!"
];

export function getPositiveMessage() {
  return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
}

const negativeMessages = [
  "Nice try! You're getting closer.",
  "Don't give up! The right word is just around the corner.",
  "Good effort! Keep those creative juices flowing.",
  "Almost there! Your next guess could be the one.",
  "You're making progress! Every guess brings you closer to the answer.",
  "That was a great attempt! The perfect word is within reach.",
  "Keep going! Your persistence will pay off.",
  "You're doing great! Sometimes the trickiest words are the most rewarding.",
  "Excellent effort! The right word is just waiting to be discovered.",
  "Stay positive! Your next guess might just be the winner.",
  "Better luck next time!",
  "So close! Give it another shot.",
  "Not quite there, but you're improving!",
  "Challenge accepted for the next round?",
  "A valiant effort! Ready to try again?",
  "The word was tricky, but you gave it your all!",
  "Practice makes perfect. Ready for another game?",
  "You'll crack it next time!",
  "That was a tough one. How about another go?",
  "Keep that spirit up! The next word is waiting.",
  "Almost had it! Your skills are growing.",
  "A worthy attempt! Care to challenge yourself again?",
  "The journey to word mastery continues!",
  "Every guess brings you closer to victory!",
  "Your persistence is admirable. One more round?"

];

export function getNegativeMessage() {
  return negativeMessages[Math.floor(Math.random() * negativeMessages.length)];
}

// 优化的单词生成和缓存机制
class WordGenerator {
  private static instance: WordGenerator;
  private readonly cache: Map<number, string[]> = new Map();
  private readonly usedIndices: Map<number, Set<number>> = new Map();
  private readonly shuffledIndices: Map<number, number[]> = new Map();

  private constructor() {
    // 初始化缓存和索引
    Object.entries(WORD_LISTS).forEach(([length, words]) => {
      const numLength = Number(length);
      this.cache.set(numLength, words); // 直接使用原始数组，避免复制
      this.usedIndices.set(numLength, new Set());
      this.shuffledIndices.set(numLength, this.generateShuffledIndices(words.length));
    });
  }

  public static getInstance(): WordGenerator {
    if (!WordGenerator.instance) {
      WordGenerator.instance = new WordGenerator();
    }
    return WordGenerator.instance;
  }

  private generateShuffledIndices(length: number | undefined): number[] {
    // 确保length是有效的数字
    if (typeof length !== 'number' || length <= 0) {
      throw new Error('长度参数必须是大于0的数字');
    }
    const indices = Array.from({ length }, (_, i) => i);
    // Fisher-Yates洗牌算法
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j] !== undefined ? indices[j]! : 0;
      indices[j] = temp !== undefined? temp : 0;
    }
    return indices;
  }

  public getRandomWord(length: number): string {
    if (length < 3 || length > 8) {
      throw new Error(`无效的单词长度: ${length}。单词长度必须在3到8之间。`);
    }

    const words = this.cache.get(length);
    const used = this.usedIndices.get(length);
    const shuffled = this.shuffledIndices.get(length);
    
    if (!words || !used || !shuffled) {
      throw new Error(`无法获取${length}个字母的单词列表。请确保单词列表已正确初始化。`);
    }

    // 如果所有单词都用过了，重新洗牌并重置使用记录
    if (used.size >= words.length) {
      used.clear();
      this.shuffledIndices.set(length, this.generateShuffledIndices(words.length));
    }

    // 从洗牌后的索引中获取未使用的单词
    for (const index of shuffled) {
      if (!used.has(index)) {
        used.add(index);
        return words[index]!.toUpperCase();
      }
    }

    return '';
  }

  public resetCache(): void {
    this.usedIndices.forEach((set, length) => {
      set.clear();
      this.shuffledIndices.set(length, this.generateShuffledIndices(this.cache.get(length)?.length || 0));
    });
  }
}

// 导出优化后的函数
export function generateRandomWords(length?: number): Record<number, string[]> {
  try {
    const result: Record<number, string[]> = {};
    const generator = WordGenerator.getInstance();
    
    // 为每个长度生成单词列表
    [3, 4, 5, 6, 7, 8].forEach(wordLength => {
      try {
        result[wordLength] = Array.from({ length: 500 }, () => 
          generator.getRandomWord(wordLength)
        ).filter((word): word is string => word !== ''); // 类型谓词确保过滤后的数组元素为string类型
      } catch (error) {
        console.error(`生成${wordLength}个字母的单词列表时出错:`, error);
        result[wordLength] = [];
      }
    });

    return result;
  } catch (error) {
    console.error('生成随机单词列表时出错:', error);
    return {};
  }
}

export function getRandomWord(length: number): string {
  try {
    return WordGenerator.getInstance().getRandomWord(length);
  } catch (error) {
    console.error('获取随机单词时出错:', error);
    return '';
  }
}

export function resetWordCache(): void {
  WordGenerator.getInstance().resetCache();
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(hours.toString().padStart(2, '0'));
  }

  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));

  return parts.join(':');
}

// Generate emoji pattern for game results
export function generateEmojiPattern(
  gridContent: string[],
  matchResults: string[],
  columns: number,
  targetWord: string,
  completedRows: number
): string {
  if (!targetWord || completedRows === 0) return '';
  
  const patterns: string[] = [];
  
  for (let row = 0; row < completedRows; row++) {
    let rowPattern = '';
    const startIndex = row * columns;
    
    for (let col = 0; col < columns; col++) {
      const cellIndex = startIndex + col;
      const cellContent = gridContent[cellIndex];
      const matchResult = matchResults[cellIndex];
      
      if (!cellContent) continue;
      
      if (matchResult === 'correct') {
        rowPattern += '🟩'; // Green for correct position
      } else if (matchResult === 'present') {
        rowPattern += '🟨'; // Yellow for correct letter, wrong position
      } else {
        rowPattern += '⬜'; // White for incorrect letter
      }
    }
    
    if (rowPattern) {
      patterns.push(rowPattern);
    }
  }
  
  return patterns.join('\n');
}

// Generate quick share text for the game
export function generateQuickShareText(wordLength: number): string {
  return `🎯 Master the Ultimate Wordless Game Challenge!\n\n🔤 Guess the ${wordLength}-letter word in 6 tries\n⏱️ Train your brain with smart color hints\n🧠 Unlimited Wordless Game challenges await\n🎮 Perfect for vocabulary building & cognitive training\n\n🔗 Play Wordless Game now: ${typeof window !== 'undefined' ? window.location.origin : ''}\n\n#WordlessGame #WordPuzzle #BrainTraining #VocabularyChallenge`;
}
