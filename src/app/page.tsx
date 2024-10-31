'use client';

import { EmailLink } from "@/components/email-link";
import Games from "@/components/games";

export default function HomePage() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
        {/* 游戏区域 */}
        <div className="w-full bg-gradient-to-b from-violet-50 via-violet-50/50 to-white py-8 md:py-16 relative game-section">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent)] pointer-events-none"></div>
          <div className="container mx-auto relative px-4">
            <Games />
          </div>
        </div>

        {/* 标题区域 */}
        <div className="w-full bg-gradient-to-b from-white via-violet-50/30 to-white py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center">
              {/* 主标题和副标题 */}
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-zinc-800 via-violet-600 to-zinc-800 bg-clip-text text-transparent">
                  Wordless Game: Discover the Secret Word
                </h2>
                <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto">
                  Here's how it works:
                </p>
              </div>

              {/* 游戏规则说明 - 重新布局为两列 */}
              <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
                {/* 左侧：游戏规则和颜色提示 */}
                <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="flex-none w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-semibold text-zinc-800 mb-2 group-hover:text-violet-600 transition-colors">
                        Guess a word
                      </h3>
                      <p className="text-zinc-600">with 3 to 8 letters</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="flex-none w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎲</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-semibold text-zinc-800 mb-2 group-hover:text-violet-600 transition-colors">
                        Use the color clues
                      </h3>
                      <div className="space-y-2 text-zinc-600">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Green means correct spot</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Yellow means wrong spot</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-zinc-400 rounded-full"></div>
                          <span>Gray means not in word</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧：游戏目标和提示 */}
                <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="flex-none w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-semibold text-zinc-800 mb-2 group-hover:text-violet-600 transition-colors">
                        Your goal
                      </h3>
                      <p className="text-zinc-600">figure out the secret word in just 6 tries</p>
                    </div>
                  </div>

                  {/* Pro Tips 部分 */}
                  <div className="flex items-start gap-6 group">
                    <div className="flex-none w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-semibold text-zinc-800 mb-2 group-hover:text-violet-600 transition-colors">
                        Pro Tips
                      </h3>
                      <div className="space-y-3 text-zinc-600">
                        <div>
                          {/* <p className="font-medium text-zinc-700">Strategy Tips:</p> */}
                          <ul className="mt-2 space-y-1.5 text-sm list-disc list-inside">
                            <li>Start with words containing common vowels (eg A, E, I, O)</li>
                            <li>Use words with common consonants (eg R, S, T, N)</li>
                            <li>Avoid repeated letters in your first guess</li>
                            <li>Use your previous guesses as clues</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮组 */}
              <div className="mt-16 flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => {
                    const gameSection = document.querySelector('.game-section');
                    if (gameSection) {
                      gameSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  className="px-8 py-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all hover:scale-105 font-medium text-lg shadow-lg shadow-violet-200"
                >
                  Let's Play!
                </button>
                <button 
                  onClick={() => {
                    const howToPlaySection = document.getElementById('how-to-play');
                    if (howToPlaySection) {
                      howToPlaySection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  className="px-8 py-3 bg-white text-violet-600 rounded-full hover:bg-violet-50 transition-all hover:scale-105 font-medium text-lg border-2 border-violet-200"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 游戏说明区域 */}
        <div id="how-to-play" className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-scale-in">
          {/* 主要说明 - 修改标题样式 */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-800">How to play the Wordless Game?</h2>
              <div className="mt-2 w-20 h-1 bg-violet-200 mx-auto rounded-full"></div>
            </div>
            
            <div className="flex items-start space-x-6">
              <span className="text-6xl font-black text-violet-500/10">1</span>
              <div className="flex-1">
                <p className="text-lg text-zinc-600 pt-4 mb-8">
                  Can you crack the hidden word? You've got 6 tries to guess it right! 
                  After each guess, we'll give you some color hints:
                </p>

                {/* 示例区域 */}
                <div className="bg-white/50 rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-zinc-700 mb-4">Examples:</h3>
                  
                  {/* 示例1：全部正确 */}
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">If the word is "HEART"</p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex gap-1 md:gap-2 flex-wrap">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          H
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          E
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          A
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          R
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          T
                        </div>
                      </div>
                      <span className="text-sm md:text-base text-zinc-600">All letters are correct and in position!</span>
                    </div>
                  </div>

                  {/* 示例2：部分正确位置 */}
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">If you guess "EARTH"</p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex gap-1 md:gap-2 flex-wrap">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          E
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          A
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          R
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          T
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          H
                        </div>
                      </div>
                      <span className="text-sm md:text-base text-zinc-600">Some letters are correct but in wrong positions</span>
                    </div>
                  </div>

                  {/* 示例3：字母存在但位置错误 */}
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">If you guess "TRAIN"</p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex gap-1 md:gap-2 flex-wrap">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          T
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          R
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-500 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          A
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          I
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          N
                        </div>
                      </div>
                      <span className="text-sm md:text-base text-zinc-600">T is correct, R and A exist but in wrong spots</span>
                    </div>
                  </div>

                  {/* 示例4：完全错误 */}
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">If you guess "CLOUD"</p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex gap-1 md:gap-2 flex-wrap">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          C
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          L
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          O
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          U
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-400 text-white font-bold flex items-center justify-center rounded text-sm md:text-base">
                          D
                        </div>
                      </div>
                      <span className="text-sm md:text-base text-zinc-600">None of these letters are in the word</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 颜色提示说明 */}
          <div className="mb-16 ml-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-semibold text-green-700">Correct Spot</span>
                </div>
                <p className="text-green-600 text-sm">Letter is in the right position</p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-semibold text-yellow-700">Wrong Spot</span>
                </div>
                <p className="text-yellow-600 text-sm">Letter exists but wrong position</p>
              </div>

              <div className="bg-zinc-50 p-6 rounded-lg border-l-4 border-zinc-400">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-zinc-400 rounded-full mr-3"></div>
                  <span className="font-semibold text-zinc-700">Not Found</span>
                </div>
                <p className="text-zinc-600 text-sm">Letter is not in the word</p>
              </div>
            </div>
          </div>

          {/* 难度说明 */}
          <div className="mb-16">
            <div className="flex items-start space-x-6">
              <span className="text-6xl font-black text-violet-500/10">2</span>
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-zinc-800 mb-2">Level Up Your Game</h3>
                <p className="text-lg text-zinc-600">
                  Use the "+" and "-" buttons to switch between 3-8 letter words. 
                  Whether you're a word newbie or a vocabulary pro, there's a perfect challenge waiting for you.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ 部分 */}
          <div className="w-full bg-gradient-to-b from-zinc-50/50 via-zinc-100/30 to-zinc-50/50 py-12 md:py-20 my-12 md:my-20 animate-fade-in [animation-delay:200ms]">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-zinc-800">Frequently Asked Questions</h2>
                <div className="mt-2 w-20 h-1 bg-violet-200 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid gap-4 md:gap-6">
                {/* Question 1 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    How do I know if my guess is correct?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    After each guess, the letters will change color to give you hints. Green means the letter is correct and in the right spot, 
                    yellow means the letter exists but is in the wrong position, and gray means the letter isn't in the word at all.
                  </p>
                </div>

                {/* Question 2 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    Can I play the same word multiple times?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    Yes! You can play as many times as you want. Use the "Reset" button to start a new game with a different word. 
                    Each game generates a new random word based on your chosen length.
                  </p>
                </div>

                {/* Question 3 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    How do I adjust the difficulty?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    Use the "+" and "-" buttons before starting a game to change the word length from 3 to 8 letters. 
                    Longer words generally provide a greater challenge. You can also track your solving time to challenge yourself.
                  </p>
                </div>

                {/* Question 4 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    What happens if I run out of tries?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    If you don't guess the word within 6 attempts, the game ends and reveals the correct word. 
                    Don't worry though - you can always start a new game and try again with a different word!
                  </p>
                </div>

                {/* Question 5 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    Can I use the keyboard to type my guesses?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    Yes! You can use either your physical keyboard or the on-screen keyboard to enter letters. 
                    Use Backspace to delete and Enter to submit your guess. The game supports both input methods for your convenience.
                  </p>
                </div>

                {/* Question 6 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    Are all words in English?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    Yes, all words are common English words. We've carefully selected words that are familiar and frequently used, 
                    making the game both challenging and educational for English language learners and native speakers alike.
                  </p>
                </div>

                {/* Question 7 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    What is the best word to start the game?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    At the beginning of the game, try to use a word without repeating letters and with as many vowels as possible, such as the word "RADIO". However, mathematician Grant Sanderson found that the best starting word is “CRANE" or “SLOTH”, which includes frequently used letters.
                  </p>
                </div>

                {/* Question 8 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    What dictionary are you using?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    In American English, we use a dictionary from the Letterpress word list that includes a list of ~275,000 words. This dictionary is constantly updated with new words based on real feedback from people.
                  </p>
                </div>

                {/* Question 9 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    Why did I get a "Word not found" message?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    This alert message means that the given word was not found in our word bank. Try another word, or if you think the word is correct, <EmailLink>let us know</EmailLink>.
                  </p>
                </div>

                {/* Question 10 */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                    <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
                    The hidden word was incorrect. Can you fix this?
                  </h3>
                  <p className="text-zinc-600 ml-12">
                    If you think that the hidden word is wrong or incorrect, <EmailLink>let us know</EmailLink>. We will definitely fix this as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部号召 */}
          <div className="text-center py-6 md:py-8 bg-violet-50 rounded-2xl mx-4 animate-float">
            <h2 className="text-2xl font-bold text-violet-900 mb-2">
              Ready to Test Your Skills?
            </h2>
            <p className="text-lg text-violet-700">
              Jump in and see how fast you can solve the puzzle!
              <span className="inline-block animate-bounce ml-2">🚀</span>
            </p>
          </div>
        </div>
      </div>
    )
} 
