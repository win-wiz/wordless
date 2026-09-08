import type { Client } from "@libsql/client";
import Link from "next/link";
import { type Metadata } from "next";

import { formatUtcDate } from "@/lib/strands-format";
import { getArchiveStrandsPuzzles, type StrandsArchiveEntry } from "@/server/strands-puzzles";
import { createTursoClient } from "@/server/turso";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Strands Archive - Past Daily Puzzles | Wordless",
  description:
    "Browse and replay past daily Strands puzzles. Every archived puzzle includes its theme and a link to the hints & answers article.",
  robots: "index, follow",
};

export default async function StrandsArchivePage() {
  // 表尚未创建（如线上 Turso 未 apply strands schema）时降级为空列表而不是让构建/渲染失败
  let entries: StrandsArchiveEntry[] = [];
  const client = createTursoClient() as Client;

  try {
    entries = await getArchiveStrandsPuzzles(client, 50);
  } catch (error) {
    console.error("load strands archive error:", error);
  } finally {
    client.close();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f5f0ea]">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">
            Strands Archive
          </h1>
          <p className="text-sm text-stone-500">
            Replay past daily puzzles or read the hints &amp; answers for each one.
          </p>
          <Link
            href="/strands-game"
            className="text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
          >
            ← Back to today&apos;s puzzle
          </Link>
        </header>

        {entries.length === 0 ? (
          <p className="rounded-3xl border border-stone-200 bg-white/80 px-6 py-8 text-center text-sm text-stone-600">
            No archived puzzles yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li
                key={entry.date}
                className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white/90 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-stone-800">
                    {formatUtcDate(entry.date, "short")}
                  </span>
                  <span className="text-sm text-stone-500">
                    Theme: {entry.theme}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {entry.articleSlug ? (
                    <Link
                      href={`/strands-game/article/${entry.articleSlug}`}
                      className="inline-flex h-9 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
                    >
                      Hints &amp; answers
                    </Link>
                  ) : null}
                  <Link
                    href={`/strands-game?date=${entry.date}`}
                    className="inline-flex h-9 items-center rounded-full bg-stone-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-stone-900"
                  >
                    Play
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
