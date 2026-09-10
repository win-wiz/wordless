import dynamic from "next/dynamic";
import HelpCenter from "@/components/waffle-game/help-center";
import WaffleBoardSkeleton from "@/components/waffle-game/waffle-board-skeleton";

const DynamicWaffleClient = dynamic(() => import("@/components/waffle-game/waffle-client"), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto flex min-h-[720px] max-w-screen-lg flex-col">
      <div className="flex flex-1 flex-col items-center py-10">
        <div className="flex min-h-[720px] w-full flex-col items-center">
          <WaffleBoardSkeleton />
        </div>
      </div>
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
