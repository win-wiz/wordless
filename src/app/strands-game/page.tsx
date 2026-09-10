import dynamic from "next/dynamic";

import { StrandsLoadingSkeleton } from "@/components/strands-game/strands-client";
import HowToPlaySection from "@/components/strands-game/how-to-play-section";
import StrandsFAQ from "@/components/strands-game/strands-faq";
import StrandsHero from "@/components/strands-game/strands-hero";
import StrandsRules from "@/components/strands-game/strands-rules";

const DynamicStrandsClient = dynamic(
  () => import("@/components/strands-game/strands-client"),
  {
    ssr: false,
    loading: () => <StrandsLoadingSkeleton />,
  },
);

export default function StrandsGamePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f5f0ea]">
      <div
        id="game-section"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col scroll-mt-24 px-4 py-8"
      >
        <DynamicStrandsClient />
      </div>

      <StrandsHero />
      <StrandsRules />
      <HowToPlaySection />
      <StrandsFAQ />
    </div>
  );
}
