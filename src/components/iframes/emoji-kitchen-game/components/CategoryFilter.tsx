'use client';

import React from 'react';
import { CategoryFilterProps } from '../types';
import CategoryButton from './CategoryButton';
import { categories } from '../data/faq-data';

const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(
  ({ activeCategory, categoryCounts, onCategoryChange }) => {
    return (
      <div className='flex flex-wrap justify-center gap-3'>
        {categories.map((category) => (
          <CategoryButton
            key={category.key}
            category={category.key}
            isActive={activeCategory === category.key}
            count={categoryCounts[category.key] || 0}
            onClick={onCategoryChange}
          />
        ))}
      </div>
    );
  }
);

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;