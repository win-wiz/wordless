import type { Client } from "@libsql/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Metadata } from "next";

import { getStrandsPuzzleBySlug } from "@/server/strands-puzzles";
import { createTursoClient } from "@/server/turso";
import type { StrandsPuzzleData } from "@/types/strands";

import { WordHints } from "./word-hints";

export const runtime = "edge";
export const revalidate = 3600;

type StrandsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

// 表尚未创建（如线上 Turso 未 apply strands schema）时降级为 null 而不是让构建/渲染失败
async function loadPuzzleBySlug(slug: string): Promise<StrandsPuzzleData | null> {
  const client = createTursoClient() as Client;

  try {
    return await getStrandsPuzzleBySlug(client, slug);
  } catch (error) {
    console.error("load strands article error:", error);
    return null;
  } finally {
    client.close();
  }
}

export async function generateMetadata({
  params,
}: StrandsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const puzzleData = await loadPuzzleBySlug(slug);

  if (!puzzleData?.puzzle.article) {
    return {
      title: "Strands Hints & Answers | Wordless",
    };
  }

  const { article } = puzzleData.puzzle;
  return {
    title: `${article.title} | Wordless Strands`,
    description: article.intro,
    robots: "index, follow",
    openGraph: {
      title: article.title,
      description: article.intro,
      type: "article",
      siteName: "Wordless Game",
    },
  };
}

export default async function StrandsArticlePage({
  params,
}: StrandsArticlePageProps) {
  const { slug } = await params;
  const puzzleData = await loadPuzzleBySlug(slug);
  const article = puzzleData?.puzzle.article;

  if (!puzzleData || !article) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f5f0ea]">
      <article className="mx-auto w-full max-w-screen-lg px-4 py-10">
        <Link
          href={`/strands-game?date=${puzzleData.date}`}
          className="text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
        >
          ← Play this puzzle
        </Link>

        <header className="mb-8 mt-4 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">
            {article.title}
          </h1>
          <p className="text-sm text-stone-500">
            {puzzleData.date} · Theme: {puzzleData.puzzle.theme}
          </p>
        </header>

        <div className="flex flex-col gap-6 text-base leading-relaxed text-stone-700">
          <p>{article.intro}</p>
          <p>{article.themeAnalysis}</p>

          <section className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5">
            <h2 className="mb-2 text-lg font-bold text-amber-900">Spangram hint</h2>
            <p className="text-amber-900/90">{article.spangramHint}</p>
          </section>

          <WordHints wordHints={article.wordHints} />

          <p>{article.outro}</p>
        </div>
      </article>
    </div>
  );
}
