import type { CellState } from "@/lib/game-state";
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
  cellStates: CellState[],
  columns: number,
  completedRows: number
): string {
  if (completedRows === 0) return '';
  
  const patterns: string[] = [];
  
  for (let row = 0; row < completedRows; row++) {
    let rowPattern = '';
    const startIndex = row * columns;
    
    for (let col = 0; col < columns; col++) {
      const cellIndex = startIndex + col;
      const cellContent = gridContent[cellIndex];
      const cellState = cellStates[cellIndex];
      
      if (!cellContent) continue;
      
      if (cellState === 'correct') {
        rowPattern += '🟩'; // Green for correct position
      } else if (cellState === 'present') {
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
