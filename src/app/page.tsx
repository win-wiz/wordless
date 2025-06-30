'use client';

import Games from "@/components/games";
import HeroSection from "@/components/hero-section";
import GameRules from "@/components/game-rules";
import HowToPlay from "@/components/how-to-play";
import FAQSection from "@/components/faq-section";
import AdBanner from "@/components/ad-banner";
import SidebarAds from "@/components/sidebar-ads";
import Script from 'next/script';

export default function HomePage() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
        {/* AdSense 脚本 */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1939625526338391"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* 侧边栏广告 - 固定定位，不影响页面布局 */}
        <SidebarAds />

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

        {/* 中间广告位 */}
        <AdBanner className="my-12" />

        {/* FAQ 部分 */}
        <FAQSection />

        {/* 底部广告位 */}
        <AdBanner className="mt-12 mb-8" slot="bottom-ad-slot" />
      </div>
    )
} 
