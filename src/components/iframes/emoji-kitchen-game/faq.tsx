'use client';

import React, { lazy, Suspense } from 'react';
import { useFAQ } from './hooks/useFAQ';

// 使用React.lazy懒加载组件
const Header = lazy(() => import('./components/Header'));
const SearchBar = lazy(() => import('./components/SearchBar'));
const CategoryFilter = lazy(() => import('./components/CategoryFilter'));
const FAQList = lazy(() => import('./components/FAQList'));
const NoResults = lazy(() => import('./components/NoResults'));
const EmptyState = lazy(() => import('./components/EmptyState'));
const Footer = lazy(() => import('./components/Footer'));

// 加载中的占位组件
const LoadingPlaceholder: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-pulse bg-slate-200 rounded-lg h-8 w-32"></div>
  </div>
);

const FAQ: React.FC = React.memo(() => {
  const {
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
  } = useFAQ();

  return (
    <div className='relative min-h-screen'>
      {/* Waffle texture background */}
      <div className='absolute inset-0 opacity-3'>
        <div className='w-full h-full' style={backgroundStyle}></div>
      </div>

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16'>
        {/* Header section */}
        <Suspense fallback={<LoadingPlaceholder />}>
          <Header />
        </Suspense>

        {/* Category filter */}
        <div className='mb-12'>
          <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-lg max-w-4xl mx-auto'>
            {/* Search box */}
            <Suspense fallback={<LoadingPlaceholder />}>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </Suspense>
            
            {/* Category buttons */}
            <Suspense fallback={<LoadingPlaceholder />}>
              <CategoryFilter 
                activeCategory={activeCategory} 
                categoryCounts={categoryCounts} 
                onCategoryChange={handleCategoryChange} 
              />
            </Suspense>
          </div>
        </div>

        {/* FAQ List Layout */}
        <Suspense fallback={<LoadingPlaceholder />}>
          <FAQList 
            filteredFAQ={filteredFAQ} 
            openItems={openItems} 
            toggleItem={toggleItem} 
            isLoaded={isLoaded} 
          />
        </Suspense>
        
        {/* No results message when search has no matches */}
        {searchQuery && filteredFAQ.length === 0 && (
          <Suspense fallback={<LoadingPlaceholder />}>
            <NoResults searchQuery={searchQuery} onClearSearch={handleClearSearch} />
          </Suspense>
        )}

        {/* Empty state */}
        {filteredFAQ.length === 0 && !searchQuery && (
          <Suspense fallback={<LoadingPlaceholder />}>
            <EmptyState onViewAll={() => handleCategoryChange('all')} />
          </Suspense>
        )}
      
        {/* Footer tip section */}
        <Suspense fallback={<LoadingPlaceholder />}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;