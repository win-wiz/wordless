import { memo } from 'react';
import GameExamples from './game-examples';
import ColorLegend from './color-legend';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = memo(function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-zinc-800">{title}</h2>
      <div className="mt-2 w-20 h-1 bg-violet-200 mx-auto rounded-full"></div>
    </div>
  );
});

interface StepSectionProps {
  stepNumber: string;
  title?: string;
  children: React.ReactNode;
}

const StepSection = memo(function StepSection({ stepNumber, title, children }: StepSectionProps) {
  return (
    <div className={`mb-16 ${stepNumber === '1' ? '' : 'ml-16'}`}>
      <div className="flex items-start space-x-6">
        <span className="text-6xl font-black text-violet-500/10">{stepNumber}</span>
        <div className="flex-1 pt-4">
          {title && <h3 className="text-lg font-semibold text-zinc-800 mb-2">{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  );
});

const CallToAction = memo(function CallToAction() {
  return (
    <div className="text-center py-6 md:py-8 bg-violet-50 rounded-2xl mx-4 animate-float">
      <h2 className="text-2xl font-bold text-violet-900 mb-2">
        Ready to Test Your Skills?
      </h2>
      <p className="text-lg text-violet-700">
        Jump in and see how fast you can solve the puzzle!
        <span className="inline-block animate-bounce ml-2">🚀</span>
      </p>
    </div>
  );
});

const HowToPlay = memo(function HowToPlay() {
  return (
    <div id="how-to-play" className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-scale-in">
      {/* 主要说明 */}
      <div className="mb-16">
        <SectionHeader title="How to play the Wordless Game?" />
        
        <StepSection stepNumber="1">
          <p className="text-lg text-zinc-600 pt-4 mb-8">
            Can you crack the hidden word? You've got 6 tries to guess it right! 
            After each guess, we'll give you some color hints:
          </p>
          <GameExamples />
        </StepSection>
      </div>

      {/* 颜色提示说明 */}
      <div className="mb-16 ml-16">
        <ColorLegend />
      </div>

      {/* 难度说明 */}
      <StepSection 
        stepNumber="2" 
        title="Level Up Your Game"
      >
        <p className="text-lg text-zinc-600">
          Use the "+" and "-" buttons to switch between 3-8 letter words. 
          Whether you're a word newbie or a vocabulary pro, there's a perfect challenge waiting for you.
        </p>
      </StepSection>

      {/* 底部号召 */}
      <CallToAction />
    </div>
  );
});

export default HowToPlay; 