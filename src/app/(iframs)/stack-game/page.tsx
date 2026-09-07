import dynamic from "next/dynamic";

import { createTursoClient } from "@/server/turso";
import { getRandomStackPuzzle } from "@/server/stack-puzzles";

const DynamicStackClient = dynamic(
  () => import("@/components/iframes/stack-game/stack-client"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[640px] items-center justify-center rounded-[2rem] border border-[#174536] bg-[radial-gradient(circle_at_top,#0f4e3b_0%,#072e24_42%,#041f18_100%)] shadow-[0_32px_80px_rgba(0,0,0,0.32)]">
        <div className="h-16 w-16 animate-pulse rounded-full border-4 border-[#d7cdab]/40 border-t-[#d7cdab]" />
      </div>
    ),
  },
);

export default async function StackGamePage() {
  const client = createTursoClient();

  try {
    const puzzle = await getRandomStackPuzzle(client);

    if (!puzzle) {
      return (
        <div className="min-h-screen bg-[#041c16]">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            <div className="rounded-[2rem] border border-[#174536] bg-[radial-gradient(circle_at_top,#0f4e3b_0%,#072e24_42%,#041f18_100%)] p-8 text-[#f6efcf] shadow-[0_32px_80px_rgba(0,0,0,0.32)]">
              <h1 className="text-3xl font-semibold tracking-tight">Stack</h1>
              <p className="mt-3 text-sm text-[#9ebdaf]">
                No stack puzzle is available yet. Generate a puzzle first, then
                reload this page.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#041c16]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <DynamicStackClient puzzle={puzzle} />
        </div>
      </div>
    );
  } finally {
    client.close();
  }
}
