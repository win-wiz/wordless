import { memo } from 'react';

interface RuleItemProps {
  icon: string;
  title: string;
  description: string | React.ReactNode;
}

const RuleItem = memo(function RuleItem({ icon, title, description }: RuleItemProps) {
  return (
    <div className="flex items-start gap-6 group">
      <div className="flex-none w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1 pt-2">
        <h3 className="text-xl font-semibold text-zinc-800 mb-2 group-hover:text-violet-600 transition-colors">
          {title}
        </h3>
        <div className="text-zinc-600">
          {description}
        </div>
      </div>
    </div>
  );
});

const ColorClues = memo(function ColorClues() {
  return (
    <div className="space-y-2 text-zinc-600">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>Green: Letter is in the correct position in Wordless Game</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span>Yellow: Letter exists but in wrong position in Wordless Game</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-zinc-400 rounded-full"></div>
        <span>Gray: Letter is not in the Wordless Game word</span>
      </div>
    </div>
  );
});

const ProTips = memo(function ProTips() {
  return (
    <div className="space-y-3 text-zinc-600">
      <ul className="mt-2 space-y-1.5 text-sm list-disc list-inside">
        <li>Start Wordless Game with words containing common vowels (A, E, I, O) for maximum information</li>
        <li>Use common consonants (R, S, T, N) to improve your Wordless Game strategy and success rate</li>
        <li>Avoid repeated letters in your first Wordless Game guess to gather more clues</li>
        <li>Use previous Wordless Game guesses as strategic clues to master the word puzzle</li>
        <li>Practice Wordless Game daily to enhance your vocabulary and cognitive skills</li>
      </ul>
    </div>
  );
});

const GameRules = memo(function GameRules() {
  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
      {/* 左侧：游戏规则和颜色提示 */}
      <RuleItem
        icon="🎯"
        title="Guess the Wordless Game word"
        description="Choose from 3 to 8 letter words in Wordless Game for customizable difficulty levels"
      />
      
      {/* 右侧：游戏目标和提示 */}
      <RuleItem
        icon="⚡"
        title="Wordless Game objective"
        description="Discover the secret word in just 6 tries with Wordless Game's intelligent hint system"
      />

      <RuleItem
        icon="🎲"
        title="Master Wordless Game color clues"
        description={<ColorClues />}
      />
      
      <RuleItem
        icon="💡"
        title="Wordless Game Pro Tips"
        description={<ProTips />}
      />
    </div>
  );
});

export default GameRules;