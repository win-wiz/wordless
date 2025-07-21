import dynamic from "next/dynamic";
import type { GameFrameProps } from '@/components/iframes/components/game-iframe';

const EMOJI_GAME_URL = 'https://memory-game.emojis.click/en';

// 动态导入GameFrame组件
const DynamicGameFrame = dynamic<GameFrameProps>(() => import('@/components/iframes/components/game-iframe').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
      </div>
    </div>
  )
});

// 动态导入帮助中心和FAQ，导入具名导出
const DynamicHelpCenter = dynamic(() => import('@/components/iframes/emoji-memory-game/help-center').then(mod => mod.HelpCenter), {
  ssr: false,
  loading: () => <div className='h-32 animate-pulse bg-gray-100 rounded-lg' />
});

const DynamicFAQ = dynamic(() => import('@/components/iframes/emoji-memory-game/faq').then(mod => mod.FAQ), {
  ssr: false,
  loading: () => <div className='h-32 animate-pulse bg-gray-100 rounded-lg' />
});

export default function EmojiMemoryGamePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 游戏区域 - 使用动态导入的GameFrame组件 */}
      <DynamicGameFrame src={EMOJI_GAME_URL} title="Emoji Memory Game" />

      {/* 帮助文档区域 */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* 帮助中心区域 - 使用动态导入 */}
        <DynamicHelpCenter />

        {/* FAQ区域 - 使用动态导入 */}
        <DynamicFAQ />
      </div>
    </div>
  );
}