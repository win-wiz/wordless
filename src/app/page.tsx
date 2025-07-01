'use client';

import Games from "@/components/games";
import HeroSection from "@/components/hero-section";
import GameRules from "@/components/game-rules";
import HowToPlay from "@/components/how-to-play";
import FAQSection from "@/components/faq-section";


export default function HomePage() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
        {/* 自动广告已在layout.tsx中配置 */}

        {/* 游戏区域 */}
        <div className="w-full bg-gradient-to-b from-violet-50 via-violet-50/50 to-white py-8 md:py-16 relative game-section">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent)] pointer-events-none"></div>
          <div className="container mx-auto relative px-4">
            <Games />
          </div>
        </div>

        {/* 英雄区域 */}
        <HeroSection />

        {/* 游戏规则区域 */}
        <div className="w-full max-w-6xl mx-auto px-4 mb-16">
          <GameRules />
        </div>

        {/* 游戏说明区域 */}
        <HowToPlay />

        {/* FAQ 部分 */}
        <FAQSection />

        {/* AMP自动广告标签 - 恢复之前的配置 */}
        <amp-auto-ads type="adsense" data-ad-client="ca-pub-1939625526338391"></amp-auto-ads>

      </div>
    )
} 
