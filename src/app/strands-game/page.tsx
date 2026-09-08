import dynamic from "next/dynamic";

import { StrandsLoadingSkeleton } from "@/components/strands-game/strands-client";

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
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <DynamicStrandsClient />
      </div>
    </div>
  );
}
