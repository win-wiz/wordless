import dynamic from "next/dynamic";
import HelpCenter from "@/components/iframes/waffle-game/help-center";

const DynamicWaffleClient = dynamic(() => import("@/components/iframes/waffle-game/waffle-client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[480px] items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50">
      <div className="h-16 w-16 animate-pulse rounded-full border-4 border-zinc-200" />
    </div>
  ),
});

export default function WaffleGamePage() {
  return (
    <div className="flex flex-col w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <DynamicWaffleClient />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <HelpCenter />
      </div>

      {/* AMP自动广告标签 - 恢复之前的配置 */}
      {/* <amp-auto-ads type="adsense" data-ad-client="ca-pub-1939625526338391"></amp-auto-ads> */}
    </div>
  );
}
