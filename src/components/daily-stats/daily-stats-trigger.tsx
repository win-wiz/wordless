"use client";

import { Trophy } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { NavIconButton } from "@/components/nav-icon-button";

export function DailyStatsPanel({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <NavIconButton
      label="Stats"
      active={pathname === "/stats"}
      className={triggerClassName}
      onClick={() => {
        router.push("/stats");
      }}
      icon={<Trophy className="h-[18px] w-[18px] text-violet-500" />}
    />
  );
}
