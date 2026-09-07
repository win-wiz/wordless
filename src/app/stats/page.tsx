import type { Metadata } from "next";

import { DailyStatsPageContent } from "@/components/daily-stats-panel";

export const metadata: Metadata = {
  title: "Personal Stats | Wordless",
  description:
    "Track your Daily Challenge streaks, best runs, and recent history in Wordless.",
};

export default function StatsPage() {
  return <DailyStatsPageContent />;
}
