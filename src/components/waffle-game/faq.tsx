'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';

interface FAQItem {
  question: string;
  answer:
    | string
    | {
        intro?: string;
        list?: string[];
        outro?: string;
      };
  category: 'game' | 'tips' | 'strategy';
}

interface FAQItemComponentProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

// Memoized FAQ item component to prevent unnecessary re-renders
const FAQItemComponent: React.FC<FAQItemComponentProps> = React.memo(
  ({ item, index, isOpen, onToggle }) => {
    const categoryStyles = useMemo(() => {
      switch (item.category) {
        case 'game':
          return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🎮' };
        case 'strategy':
          return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🧠' };
        default:
          return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '⚙️' };
      }
    }, [item.category]);

    const handleClick = useCallback(() => {
      onToggle(index);
    }, [index, onToggle]);

    const renderAnswer = useMemo(() => {
      if (typeof item.answer === 'string') {
        return <p className='text-slate-700 leading-relaxed'>{item.answer}</p>;
      }

      return (
        <div className='text-slate-700 leading-relaxed space-y-4'>
          {item.answer.intro && <p>{item.answer.intro}</p>}
          {item.answer.list && (
            <ul className='space-y-3 ml-4'>
              {item.answer.list.map((listItem, listIndex) => (
                <li key={listIndex} className='flex items-start space-x-3'>
                  <span className='inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex-shrink-0 mt-0.5'>
                    {listIndex + 1}
                  </span>
                  <span className='flex-1'>{listItem}</span>
                </li>
              ))}
            </ul>
          )}
          {item.answer.outro && (
            <p className='font-medium'>{item.answer.outro}</p>
          )}
        </div>
      );
    }, [item.answer]);

    return (
      <Card className='overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm'>
        <button
          onClick={handleClick}
          className='w-full px-6 py-4 text-left hover:bg-slate-50/50 transition-colors duration-200 flex items-center justify-between group'
        >
          <div className='flex items-center space-x-4 flex-1'>
            <div className='flex-shrink-0'>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${categoryStyles.bg} ${categoryStyles.text}`}
              >
                {categoryStyles.icon}
              </div>
            </div>

            <div className='flex-1'>
              <h3 className='text-lg font-medium text-slate-800 group-hover:text-slate-700 transition-colors pr-4 leading-tight'>
                {item.question}
              </h3>
            </div>
          </div>

          <div
            className={`transform transition-all duration-300 ${
              isOpen ? 'rotate-180 text-blue-600' : 'rotate-0 text-slate-500'
            } group-hover:text-slate-700`}
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className='px-6 pb-6'>
            <div className='bg-gradient-to-r from-slate-50/50 to-blue-50/50 rounded-xl p-4 border border-slate-200/30'>
              {renderAnswer}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

FAQItemComponent.displayName = 'FAQItemComponent';

interface CategoryButtonProps {
  category: 'all' | 'game' | 'tips' | 'strategy';
  isActive: boolean;
  count: number;
  onClick: (category: 'all' | 'game' | 'tips' | 'strategy') => void;
}

// Memoized category button component
const CategoryButton: React.FC<CategoryButtonProps> = React.memo(
  ({ category, isActive, count, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(category);
    }, [category, onClick]);

    const categoryConfig = useMemo(() => {
      switch (category) {
        case 'all':
          return { label: 'All Questions', icon: '📋' };
        case 'game':
          return { label: 'Gameplay', icon: '🎮' };
        case 'tips':
          return { label: 'Tips & Help', icon: '💡' };
        case 'strategy':
          return { label: 'Strategy', icon: '🧠' };
        default:
          return { label: 'Unknown', icon: '❓' };
      }
    }, [category]);

    return (
      <button
        onClick={handleClick}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-md'
        }`}
      >
        <span>{categoryConfig.icon}</span>
        <span>{categoryConfig.label}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            isActive ? 'bg-blue-500' : 'bg-slate-200 text-slate-500'
          }`}
        >
          {count}
        </span>
      </button>
    );
  }
);

CategoryButton.displayName = 'CategoryButton';

const FAQ: React.FC = React.memo(() => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'game' | 'tips' | 'strategy'
  >('all');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const faqData: FAQItem[] = useMemo(
    () => [
      // Game-related questions
      {
        question: 'What is Waffle Game and how do you play it?',
        answer:
          "Waffle Game is a unique word puzzle that challenges you to create 6 valid words (3 horizontal, 3 vertical) in a 5x5 grid. Players swap letters strategically using color-coded feedback: green indicates correct placement, yellow shows a letter belongs in the word but in the wrong spot, and gray means the letter doesn't belong. Each Waffle Game puzzle is carefully designed to be both challenging and solvable.",
        category: 'game'
      },
      {
        question: "How do I know when I've won a Waffle Game puzzle?",
        answer:
          'Victory in Waffle Game is achieved when all 21 letter tiles turn green, indicating perfect word placement. The game automatically recognizes completion and displays your performance stats, including moves used and completion time. Each successful Waffle Game solution demonstrates your word puzzle mastery.',
        category: 'game'
      },
      {
        question: 'What makes Waffle Game different from other word puzzles?',
        answer:
          'Waffle Game stands out with its unique 5x5 grid format and 15-move limit per puzzle. Unlike traditional word games, Waffle Game combines vocabulary skills with strategic thinking as you swap letters to form multiple intersecting words simultaneously. This innovative approach makes each Waffle Game puzzle a fresh challenge.',
        category: 'game'
      },
      {
        question: 'How does the AI assistant help in Waffle Game?',
        answer:
          "The Waffle Game AI assistant analyzes your current board state and suggests optimal moves to help you progress. This intelligent feature examines possible letter combinations and recommends strategic swaps, making Waffle Game more accessible while maintaining the challenge. It's particularly helpful when you're learning the game or stuck on a difficult puzzle.",
        category: 'game'
      },
      {
        question: 'Can I create custom Waffle Game puzzles?',
        answer:
          'Yes! Waffle Game features an AI-powered puzzle generator that creates unique, themed challenges. Whether you prefer nature, technology, or emotion-themed puzzles, the Waffle Game generator ensures each puzzle is both engaging and solvable, adding variety to your daily word puzzle experience.',
        category: 'game'
      },

      // Strategy-related questions
      {
        question:
          'What are the best strategies for solving Waffle Game puzzles?',
        answer: {
          intro: 'Master Waffle Game with these proven strategies:',
          list: [
            'Start with green letters as they are confirmed correct placements in your Waffle Game',
            'Analyze yellow letters to determine their proper positions within words',
            'Focus on intersection points where letters serve multiple words in the Waffle Game grid',
            'Look for common English word patterns to guide your letter swaps',
            'Use the AI assistant strategically when facing challenging Waffle Game puzzles'
          ],
          outro:
            'These tactics will help you solve Waffle Game puzzles more efficiently and boost your success rate.'
        },
        category: 'strategy'
      },
      {
        question: 'How do I handle complex letter swaps in Waffle Game?',
        answer: {
          intro:
            'Tackle challenging Waffle Game situations with these advanced techniques:',
          list: [
            'Build partial words first to establish a strong foundation',
            'Use intersection points to benefit multiple words simultaneously',
            'Apply elimination methods to identify incorrect letter placements',
            'Leverage the Waffle Game AI assistant for optimal solutions'
          ]
        },
        category: 'strategy'
      },
      {
        question: 'How can I improve my Waffle Game solving speed?',
        answer: {
          intro: 'Enhance your Waffle Game performance with these methods:',
          list: [
            'Study common English word patterns and letter combinations',
            'Prioritize areas with more confirmed letters',
            'Develop spatial awareness to predict swap outcomes',
            'Practice recognizing word roots and patterns',
            'Manage your moves strategically throughout each Waffle Game puzzle'
          ],
          outro:
            'Regular practice with these techniques will significantly improve your Waffle Game solving speed.'
        },
        category: 'strategy'
      },

      // Tips & Help questions
      {
        question: 'What should I do when stuck on a Waffle Game puzzle?',
        answer: {
          intro:
            'When facing a challenging Waffle Game puzzle, try these approaches:',
          list: [
            'Take a step back and look for obvious word patterns or endings',
            'Focus on intersection letters that connect multiple words',
            'Use the Waffle Game AI assistant for strategic hints',
            'Build around green letters as they are confirmed correct',
            'Work backwards from partially completed words'
          ],
          outro:
            'Remember, every Waffle Game puzzle is designed to be solvable - persistence and strategy will lead to success!'
        },
        category: 'tips'
      },
      {
        question: 'How difficult are Waffle Game puzzles?',
        answer:
          "Waffle Game puzzles are designed to be challenging yet fair for all skill levels. While there aren't explicit difficulty settings, each puzzle varies in complexity based on word choices and letter arrangements. The 15-move limit adds strategic depth to each Waffle Game challenge, making it engaging without being frustrating.",
        category: 'tips'
      },
      {
        question: 'Can I play Waffle Game on mobile devices?',
        answer: {
          intro: 'Yes! Waffle Game is fully optimized for mobile play:',
          list: [
            'Smooth performance on smartphones and tablets with touch controls',
            'Responsive design that adapts to your screen size',
            'Intuitive touch gestures for letter swaps',
            'Fast loading and reliable mobile browser experience',
            'No app download required - play Waffle Game directly in your browser'
          ],
          outro:
            'Enjoy Waffle Game on any device with a seamless, engaging experience!'
        },
        category: 'tips'
      },
      {
        question: 'What happens if I run out of moves in Waffle Game?',
        answer:
          "If you use all 15 moves in Waffle Game without solving the puzzle, don't worry! You can start a new puzzle immediately or use the AI assistant before your moves run out. Each attempt helps you learn and improve your Waffle Game strategy. Many players find that understanding their challenges leads to better performance in future puzzles.",
        category: 'tips'
      }
    ],
    []
  );

  // Cache category counts to avoid recalculation
  const categoryCounts = useMemo(() => {
    const counts = { all: faqData.length, game: 0, strategy: 0, tips: 0 };
    faqData.forEach(item => {
      counts[item.category]++;
    });
    return counts;
  }, [faqData]);

  const categories = useMemo(
    () => [
      { key: 'all', label: 'All Questions', icon: '📋' },
      { key: 'game', label: 'Gameplay', icon: '🎮' },
      { key: 'strategy', label: 'Strategy', icon: '🧠' },
      { key: 'tips', label: 'Tips & Help', icon: '💡' }
    ],
    []
  );

  const filteredFAQ = useMemo(
    () =>
      activeCategory === 'all'
        ? faqData
        : faqData.filter(item => item.category === activeCategory),
    [activeCategory, faqData]
  );

  const toggleItem = useCallback((index: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleCategoryChange = useCallback(
    (category: 'all' | 'game' | 'tips' | 'strategy') => {
      setActiveCategory(category);
    },
    []
  );

  // Cache background style to avoid recreation
  const backgroundStyle = useMemo(
    () => ({
      backgroundSize: '60px 60px'
    }),
    []
  );

  return (
    <div className='bg-gradient-to-br from-slate-200/40 via-gray-200/30 to-blue-200/45 relative'>
      {/* Waffle texture background */}
      <div className='absolute inset-0 opacity-3'>
        <div className='w-full h-full' style={backgroundStyle}></div>
      </div>

      <div className='relative z-10 max-w-6xl mx-auto px-6 py-16'>
        {/* Header section */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-slate-200/80 backdrop-blur-sm rounded-2xl mb-6 shadow-lg border border-slate-300'>
            <span className='text-2xl'>❓</span>
          </div>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-4'>
            Waffle Game FAQ: Complete Guide & Answers
          </h2>
          <div className='w-20 h-0.5 bg-gradient-to-r from-blue-500 to-slate-600 mx-auto mb-6'></div>
          <p className='text-lg text-slate-700/80 max-w-2xl mx-auto'>
            Comprehensive answers to all your questions about this engaging word
            puzzle game, from basic gameplay to advanced strategies
          </p>
        </div>

        {/* Category filter */}
        <div className='mb-12'>
          <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-lg'>
            <h3 className='text-xl font-semibold text-slate-800 mb-6 text-center'>
              Help Categories
            </h3>
            <div className='flex flex-wrap justify-center gap-3'>
              {categories.map(category => (
                <CategoryButton
                  key={category.key}
                  category={category.key as any}
                  isActive={activeCategory === category.key}
                  count={
                    categoryCounts[category.key as keyof typeof categoryCounts]
                  }
                  onClick={handleCategoryChange}
                />
              ))}
            </div>
          </div>
        </div>

        {/* FAQ list */}
        <div className='space-y-4'>
          {filteredFAQ.map((item, index) => {
            const isOpen = openItems.has(index);
            return (
              <FAQItemComponent
                key={index}
                item={item}
                index={index}
                isOpen={isOpen}
                onToggle={toggleItem}
              />
            );
          })}
        </div>

        {/* Empty state */}
        {filteredFAQ.length === 0 && (
          <div className='text-center py-16'>
            <div className='w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-4xl'>🤔</span>
            </div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>
              No Questions Found
            </h3>
            <p className='text-slate-700'>
              Select different categories or view all questions
            </p>
          </div>
        )}

        {/* Footer tip section */}
        <div className='mt-16'>
          <div className='text-center'>
            <div className='bg-gradient-to-r from-slate-100/80 to-blue-100/80 backdrop-blur-sm rounded-xl p-6 border border-slate-300/60 shadow-md'>
              <p className='text-slate-700 font-medium'>
                💫 Need more help? Try the AI suggestion feature in-game, or
                generate new challenges to practice your skills!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;
