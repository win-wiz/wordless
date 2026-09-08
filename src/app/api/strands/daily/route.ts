import type { Client } from "@libsql/client";
import { NextResponse, type NextRequest } from "next/server";

import { getDailyStrandsPuzzle } from "@/server/strands-puzzles";
import { createTursoClient } from "@/server/turso";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const client = createTursoClient() as Client;

  try {
    const requestedDate = request.nextUrl.searchParams.get("date")?.trim();
    // §3.8：确实无题返回 { data: null }，DB 故障走 catch 返回 500
    const data = await getDailyStrandsPuzzle(client, requestedDate || undefined);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("load daily strands puzzle error:", error);

    return NextResponse.json(
      { error: "Couldn't load the daily Strands puzzle. Please try again." },
      { status: 500 },
    );
  } finally {
    client.close();
  }
}
