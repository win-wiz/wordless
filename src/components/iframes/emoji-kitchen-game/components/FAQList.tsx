'use client';

import React from 'react';
import { FAQListProps } from '../types';
import FAQItem from './FAQItem';

const FAQList: React.FC<FAQListProps> = React.memo(
  ({ filteredFAQ, openItems, toggleItem, isLoaded }) => {
    return (
      <div className='space-y-4 mb-12 max-w-4xl mx-auto'>
        {filteredFAQ.map((item, index) => {
          const isOpen = openItems.has(index);
          return (
            <div
              key={index}
              className={`transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <FAQItem
                item={item}
                index={index}
                isOpen={isOpen}
                onToggle={toggleItem}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

FAQList.displayName = 'FAQList';

export default FAQList;