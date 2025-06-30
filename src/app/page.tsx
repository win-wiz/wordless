'use client';

import Games from "@/components/games";
import HeroSection from "@/components/hero-section";
import GameRules from "@/components/game-rules";
import HowToPlay from "@/components/how-to-play";
import FAQSection from "@/components/faq-section";
import AdBanner from "@/components/ad-banner";
import SidebarAds from "@/components/sidebar-ads";
import MobileAd from "@/components/mobile-ad";

export default function HomePage() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
        {/* 侧边栏广告 - 桌面端固定定位 */}
        <SidebarAds />

        {/* 顶部移动广告 - 仅移动端和平板显示 */}
        <MobileAd position="top" />

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

        {/* 中间广告位 - 桌面端和平板 */}
        <AdBanner className="my-12" position="middle" />

        {/* FAQ 部分 */}
        <FAQSection />

        {/* 底部广告位 - 桌面端 */}
        <AdBanner className="mt-12 mb-8" slot="bottom-ad-slot" position="bottom" />

        {/* 底部移动广告 - 仅移动端和平板显示 */}
        <MobileAd position="bottom" className="sticky bottom-0 z-40" />
      </div>
    )
} 
