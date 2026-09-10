import type { ReactNode } from "react";

type StrandsBoardLayoutProps = {
  sidePanel: ReactNode;
  grid: ReactNode;
};

export default function StrandsBoardLayout({
  sidePanel,
  grid,
}: StrandsBoardLayoutProps) {
  return (
    <div className="flex w-full flex-col items-center lg:min-h-[max(38rem,calc(100dvh-10rem))] lg:justify-center">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-5 lg:max-w-5xl lg:grid lg:grid-cols-2 lg:gap-x-14">
        <div className="order-1 w-full lg:order-1 lg:h-full lg:min-h-0">
          {sidePanel}
        </div>
        <div className="order-2 w-full lg:order-2 lg:flex lg:items-center">
          {grid}
        </div>
      </div>
    </div>
  );
}
