'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';

// 导入数据
import { 
  FEATURES_DATA, 
  STEPS_DATA, 
  TIPS_DATA, 
  FAQ_DATA 
} from './data';

// 导入组件
import {
  FeatureCard,
  StepCard,
  TipCard,
  FaqCard,
  SectionHeader,
  NavigationButton,
  CallToAction,
  FeatureStats
} from './components';

// 导入工具函数
import { smoothScrollTo, scrollToTop } from './utils/scrollUtils';

// 类型定义
interface HelpCenterProps {
  className?: string;
}

// 主组件
const HelpCenter: React.FC<HelpCenterProps> = ({ className = '' }) => {
  // 使用useMemo优化统计数据，避免重复计算
  const statsData = useMemo(() => [
    {
      value: '6+',
      label: 'Core Features',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      value: '100%',
      label: 'Mobile Compatible',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      value: '∞',
      label: 'Possible Combinations',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      value: 'AI',
      label: 'Powered',
      gradient: 'from-orange-600 to-red-600'
    }
  ], []);

  // 使用useCallback优化事件处理函数
  const handleFeaturesClick = useCallback(() => smoothScrollTo('features', 80), []);
  const handleHowToUseClick = useCallback(() => smoothScrollTo('how-to-use', 80), []);
  const handleTipsClick = useCallback(() => smoothScrollTo('tips', 80), []);
  const handleScrollToTop = useCallback(() => scrollToTop(), []);

  return (
    <main className={`min-h-screen w-full bg-white ${className}`}>
      {/* SEO-Optimized Header */}
      <header className='py-16 px-4 sm:px-6'>
        <div className='max-w-[1400px] mx-auto text-center'>
          <b className='inline-block text-5xl sm:text-6xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-16 leading-10'>
            Ultimate Emoji Kitchen Game Guide: Mix, Create & Share Emoji Combinations
          </b>
          <p className='text-xl sm:text-2xl text-slate-700 mx-auto leading-relaxed max-w-5xl mb-8'>
            Welcome to the official Emoji Kitchen Game help center! Master our AI-powered Emoji Kitchen Game that lets you blend any two emojis into unique creative combinations. This comprehensive Emoji Kitchen Game guide covers everything from basic emoji mixing techniques to advanced Emoji Kitchen Game features that both beginners and emoji design experts will love.
          </p>
          
          {/* Quick Navigation */}
          <div className='flex flex-wrap justify-center gap-4 mt-8'>
            <NavigationButton 
              onClick={handleFeaturesClick}
              bgColor="bg-blue-500"
              hoverBgColor="hover:bg-blue-600"
            >
              Features
            </NavigationButton>
            <NavigationButton 
              onClick={handleHowToUseClick}
              bgColor="bg-green-500"
              hoverBgColor="hover:bg-green-600"
            >
              How To Use
            </NavigationButton>
            <NavigationButton 
              onClick={handleTipsClick}
              bgColor="bg-purple-500"
              hoverBgColor="hover:bg-purple-600"
            >
              Pro Tips
            </NavigationButton>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className='w-full px-4 sm:px-6 py-8'>
        <div className='max-w-[1400px] mx-auto'>
          
          {/* Features Section */}
          <section id='features' className='mb-20'>
            <SectionHeader 
              icon="✨"
              title="Six Essential Emoji Kitchen Game Features You'll Love"
              description="The Emoji Kitchen Game delivers a complete emoji creation experience with these powerful Emoji Kitchen Game features. From advanced AI-powered emoji synthesis to seamless cross-platform sharing options, every aspect of the Emoji Kitchen Game is expertly designed to maximize your creative potential and enhance your emoji mixing enjoyment."
              iconBgColor="from-blue-500 to-indigo-600"
            />
            
            {/* Features Display - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {FEATURES_DATA.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
            
            {/* Feature Statistics */}
            <FeatureStats stats={statsData} />
          </section>

          {/* How To Use Section */}
          <section id='how-to-use' className='mb-20'>
            <SectionHeader 
              icon="🎮"
              title="Master the Emoji Kitchen Game in Four Simple Steps"
              description="New to the Emoji Kitchen Game? You can create amazing Emoji Kitchen Game combinations in just minutes! Follow our detailed Emoji Kitchen Game tutorial below to quickly learn the emoji mixing process and start your creative Emoji Kitchen Game journey today with professional-quality results."
              iconBgColor="from-green-500 to-emerald-600"
              iconRotation="-rotate-12"
            />
            
            {/* Steps Process */}
            <div className='relative max-w-6xl mx-auto'>
              {/* Desktop Progress Line */}
              <div className='hidden lg:block absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-0.5 bg-gradient-to-r from-green-400 via-blue-500 via-purple-500 to-pink-500 rounded-full shadow-sm z-0'></div>
              
              {/* Step Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 items-stretch'>
                {STEPS_DATA.map((step, index) => (
                  <StepCard key={index} step={step} index={index} />
                ))}
              </div>
              
              {/* Call to Action */}
              <div className='mt-12 text-center'>
                <CallToAction 
                  onClick={handleScrollToTop}
                  text="Ready to start your Emoji Kitchen Game adventure today?"
                  icon="🚀"
                />
              </div>
            </div>
          </section>

          {/* Pro Tips Section */}
          <section id='tips' className='mb-20'>
            <SectionHeader 
              icon="💡"
              title="Expert Emoji Kitchen Game Creation Tips & Techniques"
              description="Elevate your Emoji Kitchen Game experience with these professional Emoji Kitchen Game tips and creative techniques. Whether you're a beginner exploring the Emoji Kitchen Game or an advanced emoji designer, these expert Emoji Kitchen Game strategies will help you create more impressive emoji combinations and unlock the full creative potential of the Emoji Kitchen Game platform."
              iconBgColor="from-yellow-500 to-orange-600"
            />
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
              {TIPS_DATA.map((tip, index) => (
                <TipCard key={index} tip={tip} />
              ))}
            </div>
          </section>

          {/* Quick FAQ Section */}
          <section className='mb-20'>
            <SectionHeader 
              icon="❓"
              title="Emoji Kitchen Game FAQ: Quick Answers to Common Questions"
              description="Have questions about using the Emoji Kitchen Game? Here are quick answers to the most frequently asked Emoji Kitchen Game questions. For more detailed information about all Emoji Kitchen Game features and capabilities, visit our complete Emoji Kitchen Game FAQ page for comprehensive guidance."
              iconBgColor="from-red-500 to-pink-600"
              iconRotation="-rotate-12"
            />
            
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
              {FAQ_DATA.map((faq, index) => (
                <FaqCard key={index} faq={faq} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

// 组件显示名称，方便调试
HelpCenter.displayName = 'HelpCenter';

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(HelpCenter);