'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { FAQItem, CategoryType } from '../types';
import { faqData } from '../data/faq-data';

export const useFAQ = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // 页面加载动画效果
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 切换FAQ项目的展开/折叠状态
  const toggleItem = useCallback((index: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Cache background style to avoid recreation
  const backgroundStyle = useMemo(
    () => ({
      backgroundSize: '60px 60px',
    }),
    []
  );

  // Cache category counts to avoid recalculation
  const categoryCounts = useMemo(() => {
    const counts = { all: faqData.length, general: 0, usage: 0, technical: 0, sharing: 0, privacy: 0 };
    faqData.forEach((item) => {
      counts[item.category]++;
    });
    return counts;
  }, []);

  const filteredFAQ = useMemo(() => {
    // 先按类别筛选
    const categoryFiltered =
      activeCategory === 'all' ? faqData : faqData.filter((item) => item.category === activeCategory);

    // 如果有搜索查询，再按搜索内容筛选
    if (!searchQuery.trim()) {
      return categoryFiltered;
    }

    const query = searchQuery.toLowerCase().trim();
    return categoryFiltered.filter((item) => {
      // 搜索问题文本
      if (item.question.toLowerCase().includes(query)) {
        return true;
      }

      // 搜索答案文本
      if (typeof item.answer === 'string') {
        return item.answer.toLowerCase().includes(query);
      } else {
        // 搜索列表型答案
        if (item.answer.intro && item.answer.intro.toLowerCase().includes(query)) {
          return true;
        }
        if (item.answer.list && item.answer.list.some((point) => point.toLowerCase().includes(query))) {
          return true;
        }
        if (item.answer.outro && item.answer.outro.toLowerCase().includes(query)) {
          return true;
        }
      }

      return false;
    });
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = useCallback((category: CategoryType) => {
    setActiveCategory(category);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 平滑滚动函数
  const smoothScrollTo = useCallback((elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  return {
    activeCategory,
    searchQuery,
    isLoaded,
    openItems,
    backgroundStyle,
    categoryCounts,
    filteredFAQ,
    setSearchQuery,
    toggleItem,
    handleCategoryChange,
    handleClearSearch,
    smoothScrollTo,
  };
};