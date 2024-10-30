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

export function generateRandomWords(): Record<number, string[]> {
  const words: Record<number, string[]> = {
    3: [
      // 常用三字母单词
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can',
      'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him',
      'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
      'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'dad',
      // ... 继续添加更多常用三字母单词直到100个
    ],
    4: [
      // 常用四字母单词
      'time', 'life', 'work', 'home', 'love', 'year', 'hand', 'mind', 'help',
      'word', 'some', 'make', 'take', 'find', 'here', 'more', 'look', 'good',
      'give', 'live', 'feel', 'have', 'play', 'read', 'keep', 'hope', 'talk',
      'walk', 'turn', 'move', 'like', 'show', 'need', 'want', 'tell', 'call',
      // ... 继续添加更多常用四字母单词直到100个
    ],
    5: [
      // 常用五字母单词
      'world', 'house', 'about', 'think', 'would', 'could', 'first', 'water',
      'after', 'where', 'right', 'thing', 'place', 'great', 'again', 'heart',
      'study', 'learn', 'plant', 'light', 'every', 'never', 'start', 'might',
      'story', 'point', 'heard', 'whole', 'earth', 'found', 'state', 'stand',
      // ... 继续添加更多常用五字母单词直到100个
    ],
    6: [
      // 常用六字母单词
      'people', 'before', 'family', 'school', 'friend', 'mother', 'father',
      'should', 'system', 'social', 'number', 'always', 'nature', 'public',
      'action', 'reason', 'person', 'change', 'health', 'market', 'morning',
      'spirit', 'simple', 'wonder', 'better', 'theory', 'result', 'moment',
      // ... 继续添加更多常用六字母单词直到100个
    ],
    7: [
      // 常用七字母单词
      'because', 'through', 'history', 'present', 'without', 'between',
      'country', 'example', 'science', 'problem', 'company', 'service',
      'general', 'program', 'question', 'working', 'system', 'government',
      'different', 'national', 'possible', 'another', 'student', 'process',
      // ... 继续添加更多常用七字母单词直到100个
    ],
    8: [
      // 常用八字母单词
      'children', 'business', 'important', 'together', 'education', 'practice',
      'position', 'possible', 'interest', 'american', 'activity', 'decision',
      'personal', 'computer', 'national', 'research', 'evidence', 'security',
      'economic', 'political', 'remember', 'hospital', 'material', 'continue',
      // ... 继续添加更多常用八字母单词直到100个
    ]
  };

  // // 为每个长度生成随机单词列表
  // Object.keys(words).forEach(length => {
  //   const baseWords = words[length];
  //   const result = new Set<string>();
  //   // 确保生成100个不重复的单词
  //   while (result.size < 100) {
  //     const randomWord = baseWords[Math.floor(Math.random() * baseWords.length)];
  //     result.add(randomWord);
  //   }
  //   words[length] = Array.from(result);
  // });

  return words;
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
