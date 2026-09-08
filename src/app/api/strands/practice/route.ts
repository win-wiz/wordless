import type { Client } from "@libsql/client";
import { NextResponse } from "next/server";

import { getRandomStrandsPuzzle } from "@/server/strands-puzzles";
import { createTursoClient } from "@/server/turso";

export const runtime = "edge";

export async function GET() {
  const client = createTursoClient() as Client;

  try {
    // §3.8：确实无题返回 { data: null }，DB 故障走 catch 返回 500
    const data = await getRandomStrandsPuzzle(client);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("load practice strands puzzle error:", error);

    return NextResponse.json(
      { error: "Couldn't load a practice Strands puzzle. Please try again." },
      { status: 500 },
    );
  } finally {
    client.close();
  }
}
