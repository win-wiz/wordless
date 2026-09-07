import Games from "@/components/games";
import HeroSection from "@/components/hero-section";
import GameRules from "@/components/game-rules";
import HowToPlay from "@/components/how-to-play";
import FAQSection from "@/components/faq-section";
import { Suspense } from "react";
import { GAME_MODE_DEFINITIONS } from "@/lib/game-mode-config";
import type { RuntimeGameModeConfig } from "@/server/game-modes";
import { getGameModeConfig } from "@/server/game-modes";
import { createTursoClient } from "@/server/turso";


export default async function HomePage() {
    const fallbackDailyConfig = GAME_MODE_DEFINITIONS.daily as RuntimeGameModeConfig;
    const fallbackUnlimitedConfig = GAME_MODE_DEFINITIONS.unlimited as RuntimeGameModeConfig;
    let initialDailyConfig = fallbackDailyConfig;
    let initialUnlimitedConfig = fallbackUnlimitedConfig;
    let client: ReturnType<typeof createTursoClient> | null = null;

    try {
      client = createTursoClient();
      const [resolvedDailyConfig, resolvedUnlimitedConfig] = await Promise.all([
        getGameModeConfig(client, "daily"),
        getGameModeConfig(client, "unlimited"),
      ]);

      if (resolvedDailyConfig) {
        initialDailyConfig = resolvedDailyConfig;
      }

      if (resolvedUnlimitedConfig) {
        initialUnlimitedConfig = resolvedUnlimitedConfig;
      }
    } catch (error) {
      console.error("Failed to load game mode config for home page:", error);
    } finally {
      client?.close();
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
        {/* 自动广告已在layout.tsx中配置 */}

        {/* 游戏区域 */}
        <div
          id="game-section"
          className="game-section relative w-full scroll-mt-24 bg-gradient-to-b from-violet-50 via-violet-50/50 to-white py-8 md:scroll-mt-28 md:pt-16 md:pb-32"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent)] pointer-events-none"></div>
          <div className="container mx-auto relative px-4">
            <Suspense
              fallback={
                <div className="flex min-h-[600px] items-center justify-center">
                  <div className="relative">
                    <div className="h-12 w-12 animate-loading rounded-full border-4 border-violet-200 border-t-violet-500" />
                    <span className="absolute left-1/2 top-14 -translate-x-1/2 text-violet-500">
                      Loading...
                    </span>
                  </div>
                </div>
              }
            >
              <Games
                initialDailyConfig={initialDailyConfig}
                initialUnlimitedConfig={initialUnlimitedConfig}
              />
            </Suspense>
          </div>
        </div>

        {/* 英雄区域 */}
        <HeroSection />

        {/* 游戏规则区域 */}
        <div className="w-full max-w-6xl mx-auto px-4 pt-10 mb-16">
          <GameRules />
        </div>

        {/* 游戏说明区域 */}
        <HowToPlay />

        {/* FAQ 部分 */}
        <FAQSection />


        {/* AMP自动广告标签 - 恢复之前的配置 */}
        {/* <amp-auto-ads type="adsense" data-ad-client="ca-pub-1939625526338391"></amp-auto-ads> */}

      </div>
    )
} 
