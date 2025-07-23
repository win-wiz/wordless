'use client';

import React, { useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { FAQItemComponentProps } from '../types';

// 获取类别样式的函数，提取为纯函数以便于测试和复用
export const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'general':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🎯' };
    case 'usage':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: '🎮' };
    case 'technical':
      return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '⚙️' };
    case 'sharing':
      return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '📤' };
    default:
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🔒' };
  }
};

// 渲染答案的组件
const AnswerContent: React.FC<{ answer: FAQItemComponentProps['item']['answer'] }> = React.memo(
  ({ answer }) => {
    if (typeof answer === 'string') {
      return <p className='text-slate-700 leading-relaxed'>{answer}</p>;
    }

    return (
      <div className='text-slate-700 leading-relaxed space-y-4'>
        {answer.intro && <p>{answer.intro}</p>}
        {answer.list && (
          <ul className='space-y-3 ml-4'>
            {answer.list.map((listItem, listIndex) => (
              <li key={listIndex} className='flex items-start space-x-3'>
                <span className='inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex-shrink-0 mt-0.5'>
                  {listIndex + 1}
                </span>
                <span className='flex-1'>{listItem}</span>
              </li>
            ))}
          </ul>
        )}
        {answer.outro && <p className='font-medium'>{answer.outro}</p>}
      </div>
    );
  }
);

AnswerContent.displayName = 'AnswerContent';

// 主FAQItem组件
const FAQItem: React.FC<FAQItemComponentProps> = React.memo(
  ({ item, index, isOpen, onToggle }) => {
    const categoryStyles = useMemo(() => getCategoryStyles(item.category), [item.category]);

    const handleClick = useCallback(() => {
      onToggle(index);
    }, [index, onToggle]);

    return (
      <Card className='overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl'>
        <button
          onClick={handleClick}
          className='w-full px-6 py-5 text-left hover:bg-slate-50/50 transition-colors duration-200 flex items-center justify-between group'
        >
          <div className='flex items-center space-x-4 flex-1'>
            <div className='flex-shrink-0'>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${categoryStyles.bg} ${categoryStyles.text} shadow-sm`}
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
            <div className='bg-gradient-to-r from-slate-50/50 to-blue-50/50 rounded-xl p-5 border border-slate-200/30 shadow-inner'>
              <AnswerContent answer={item.answer} />
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

FAQItem.displayName = 'FAQItem';

export default FAQItem;