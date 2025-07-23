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
    <div className="mb-16">
      <div className="flex items-start gap-6">
        <span className="text-6xl font-black text-violet-500/10 hidden md:block">{stepNumber}</span>
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
        Ready to Master the Challenge?
      </h2>
      <p className="text-lg text-violet-700">
        Jump into Wordless Game and see how fast you can solve the word puzzle! 
        Start your brain training journey today.
        <span className="inline-block animate-bounce ml-2">🚀</span>
      </p>
    </div>
  );
});

const HowToPlay = memo(function HowToPlay() {
  return (
    <div id="how-to-play" className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-scale-in">
      <SectionHeader title="How to Play - Master the Word Puzzle" />
      
      <div className="flex flex-col gap-16">
        {/* Step 1: Main Instructions */}
        <div>
          <StepSection stepNumber="1">
            <p className="text-lg text-zinc-600 mb-8">
              Can you crack the hidden word? You've got 6 tries to guess it right! 
              After each guess, our intelligent system provides smart color hints to guide your 
              strategy and improve your vocabulary skills:
            </p>
            <GameExamples />
          </StepSection>
        </div>

        {/* Color Legend */}
        <div className="md:pl-[88px]">
          <ColorLegend />
        </div>

        {/* Step 2: Difficulty Explanation */}
        <div>
          <StepSection 
            stepNumber="2" 
            title="Choose Your Challenge Level"
          >
            <p className="text-lg text-zinc-600">
              Wordless Game offers customizable difficulty levels. Use the "+" and "-" buttons to switch between 3-8 letter words. 
              Whether you're a beginner or a vocabulary expert, there's a perfect challenge 
              waiting to enhance your cognitive abilities and word recognition skills.
            </p>
          </StepSection>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16">
        <CallToAction />
      </div>
    </div>
  );
});

export default HowToPlay;