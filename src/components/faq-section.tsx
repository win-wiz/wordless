import { memo } from 'react';
import FAQ from './faq';

const FAQSection = memo(function FAQSection() {
  return (
    <div className="w-full bg-gradient-to-b from-zinc-50/50 via-zinc-100/30 to-zinc-50/50 py-12 my-12 animate-fade-in [animation-delay:200ms]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-800">Wordless Game - Frequently Asked Questions</h2>
          <div className="mt-2 w-20 h-1 bg-violet-200 mx-auto rounded-full"></div>
          <p className="text-lg text-zinc-600 mt-4 max-w-2xl mx-auto">
            Find answers to common Wordless Game questions and learn how to master this engaging word puzzle challenge.
          </p>
        </div>
        
        <FAQ />
      </div>
    </div>
  );
});

export default FAQSection;