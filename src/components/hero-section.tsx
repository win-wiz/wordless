import { memo } from 'react';

const HeroSection = memo(function HeroSection() {
  const scrollToGame = () => {
    const gameSection = document.querySelector('.game-section');
    if (gameSection) {
      gameSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToHowToPlay = () => {
    const howToPlaySection = document.getElementById('how-to-play');
    if (howToPlaySection) {
      howToPlaySection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-white via-violet-50/30 to-white py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center">
          {/* 主标题和副标题 */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-zinc-800 via-violet-600 to-zinc-800 bg-clip-text text-transparent">
              Wordless Game: Master the Ultimate Word Puzzle Challenge
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto">
              Experience the most engaging Wordless Game online! Train your brain with smart color hints, 
              unlimited Wordless Game challenges, and customizable difficulty levels. Perfect for vocabulary 
              building and cognitive enhancement through Wordless Game brain training.
            </p>
          </div>

          {/* 操作按钮组 */}
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            <button 
              onClick={scrollToGame}
              className="px-8 py-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all hover:scale-105 font-medium text-lg shadow-lg shadow-violet-200"
            >
              Play Wordless Game Now!
            </button>
            <button 
              onClick={scrollToHowToPlay}
              className="px-8 py-3 bg-white text-violet-600 rounded-full hover:bg-violet-50 transition-all hover:scale-105 font-medium text-lg border-2 border-violet-200"
            >
              Learn Wordless Game Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HeroSection;