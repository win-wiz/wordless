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
  );
});

const ProTips = memo(function ProTips() {
  return (
    <div className="space-y-3 text-zinc-600">
      <ul className="mt-2 space-y-1.5 text-sm list-disc list-inside">
        <li>Start with words containing common vowels (eg A, E, I, O)</li>
        <li>Use words with common consonants (eg R, S, T, N)</li>
        <li>Avoid repeated letters in your first guess</li>
        <li>Use your previous guesses as clues</li>
      </ul>
    </div>
  );
});

const GameRules = memo(function GameRules() {
  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
      {/* 左侧：游戏规则和颜色提示 */}
      <div className="space-y-8">
        <RuleItem
          icon="🎯"
          title="Guess a word"
          description="with 3 to 8 letters"
        />
        <RuleItem
          icon="🎲"
          title="Use the color clues"
          description={<ColorClues />}
        />
      </div>

      {/* 右侧：游戏目标和提示 */}
      <div className="space-y-8">
        <RuleItem
          icon="⚡"
          title="Your goal"
          description="figure out the secret word in just 6 tries"
        />
        <RuleItem
          icon="💡"
          title="Pro Tips"
          description={<ProTips />}
        />
      </div>
    </div>
  );
});

export default GameRules; 