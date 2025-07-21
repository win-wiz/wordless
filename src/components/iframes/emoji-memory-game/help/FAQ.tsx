"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string | {
    intro?: string;
    list?: string[];
    outro?: string;
  };
  category: 'game' | 'tips' | 'strategy';
}

const FAQ: React.FC = React.memo(() => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'game' | 'tips' | 'strategy'>('all');

  const faqData: FAQItem[] = useMemo(() => [
    {
      question: 'How do I start playing Emoji Memory Game?',
      answer: 'Simply choose your preferred difficulty level (Beginner, Intermediate, Advanced, or Expert) and click on any card to begin. The timer starts when you flip your first card.',
      category: 'game'
    },
    {
      question: 'What happens if I run out of time?',
      answer: 'If the timer reaches zero before you complete all pairs, the game ends. You can restart the level or choose a different difficulty. Don\'t worry - practice makes perfect!',
      category: 'game'
    },
    {
      question: 'How is bonus time calculated?',
      answer: {
        intro: 'Bonus time is awarded based on your performance and difficulty level:',
        list: [
          'Beginner: +20 seconds per level completed',
          'Intermediate: +30 seconds per level completed',
          'Advanced: +40 seconds per level completed',
          'Expert: +50 seconds per level completed'
        ],
        outro: 'Better performance in previous levels can increase your bonus time allocation.'
      },
      category: 'game'
    },
    {
      question: 'Can I pause the game?',
      answer: 'The timer automatically pauses during level transitions, giving you time to prepare for the next challenge. However, you cannot manually pause during active gameplay.',
      category: 'game'
    },
    {
      question: 'What\'s the best strategy for beginners?',
      answer: {
        intro: 'For new players, we recommend:',
        list: [
          'Start with the Beginner difficulty to learn the mechanics',
          'Flip cards systematically (row by row or column by column)',
          'Focus on remembering positions rather than rushing',
          'Take your time - accuracy is more important than speed'
        ],
        outro: 'Practice regularly to build your visual memory skills.'
      },
      category: 'tips'
    },
    {
      question: 'How can I improve my memory for the game?',
      answer: {
        intro: 'Here are proven techniques to enhance your memory performance:',
        list: [
          'Use spatial memory - associate emojis with their grid positions',
          'Create mental stories or connections with the emojis',
          'Practice the "memory palace" technique',
          'Take short breaks between sessions to avoid mental fatigue'
        ],
        outro: 'Regular practice is key to developing stronger visual memory skills.'
      },
      category: 'tips'
    },
    {
      question: 'Should I focus on speed or accuracy?',
      answer: 'Focus on accuracy first, especially when learning. Speed will naturally improve as you develop better memory strategies and pattern recognition. Remember, fewer moves lead to better scores.',
      category: 'tips'
    },
    {
      question: 'What\'s the most effective card flipping pattern?',
      answer: {
        intro: 'Advanced players often use these systematic approaches:',
        list: [
          'Row-by-row scanning for initial exploration',
          'Focus on emojis you\'ve seen twice for quick pairs',
          'Use elimination strategy for remaining cards',
          'Prioritize corner and edge positions for easier recall'
        ],
        outro: 'Develop your own consistent system and stick with it.'
      },
      category: 'strategy'
    },
    {
      question: 'How do I handle higher difficulty levels?',
      answer: {
        intro: 'For Advanced and Expert levels:',
        list: [
          'Spend more time on initial card exploration',
          'Use advanced memory techniques like chunking',
          'Stay calm and don\'t panic when time gets low',
          'Focus on building consistent performance for bonus time'
        ],
        outro: 'Higher difficulties require patience and systematic approaches.'
      },
      category: 'strategy'
    },
    {
      question: 'What should I do when I\'m stuck?',
      answer: 'When you\'re having trouble finding pairs, take a deep breath and systematically review areas you haven\'t explored recently. Sometimes taking a brief mental pause can help refresh your memory.',
      category: 'strategy'
    }
  ], []);

  const filteredFAQ = useMemo(() => {
    return activeCategory === 'all' 
      ? faqData 
      : faqData.filter(item => item.category === activeCategory);
  }, [faqData, activeCategory]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const categoryButtons = [
    { key: 'all' as const, label: 'All', count: faqData.length },
    { key: 'game' as const, label: 'Game Rules', count: faqData.filter(item => item.category === 'game').length },
    { key: 'tips' as const, label: 'Tips', count: faqData.filter(item => item.category === 'tips').length },
    { key: 'strategy' as const, label: 'Strategy', count: faqData.filter(item => item.category === 'strategy').length }
  ];

  const renderAnswer = (answer: FAQItem['answer']) => {
    if (typeof answer === 'string') {
      return <p className='text-slate-600 leading-relaxed'>{answer}</p>;
    }

    return (
      <div className='space-y-4'>
        {answer.intro && (
          <p className='text-slate-600 leading-relaxed'>{answer.intro}</p>
        )}
        {answer.list && (
          <ul className='space-y-2 ml-4'>
            {answer.list.map((item, index) => (
              <li key={index} className='flex items-start gap-3 text-slate-600'>
                <span className='w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0'></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        {answer.outro && (
          <p className='text-slate-600 leading-relaxed'>{answer.outro}</p>
        )}
      </div>
    );
  };

  return (
    <div className='py-20 px-6'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-4xl font-bold text-slate-800 mb-16 text-center'>
          🤔 Frequently Asked Questions
        </h2>
        
        {/* Category Filter */}
        <div className='flex flex-wrap justify-center gap-4 mb-12'>
          {categoryButtons.map(button => (
            <button
              key={button.key}
              onClick={() => setActiveCategory(button.key)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeCategory === button.key
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {button.label} ({button.count})
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className='space-y-4'>
          {filteredFAQ.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div key={index} className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <button
                  onClick={() => toggleItem(index)}
                  className='w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200'
                >
                  <h3 className='text-lg font-semibold text-slate-800 pr-4'>
                    {item.question}
                  </h3>
                  {isOpen ? (
                    <ChevronUp className='w-5 h-5 text-slate-500 flex-shrink-0' />
                  ) : (
                    <ChevronDown className='w-5 h-5 text-slate-500 flex-shrink-0' />
                  )}
                </button>
                {isOpen && (
                  <div className='px-8 pb-6'>
                    {renderAnswer(item.answer)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className='mt-16 text-center'>
          <div className='p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100'>
            <h3 className='text-xl font-bold text-slate-800 mb-4'>
              Still Have Questions?
            </h3>
            <p className='text-slate-600 leading-relaxed'>
              These FAQs cover the most common questions about Emoji Memory Game.
              The best way to learn is by playing! Start with the Beginner level
              and work your way up as you develop your memory skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;