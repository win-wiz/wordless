import { NextResponse, type NextRequest } from "next/server";

import {
  applyInvalidAuthSessionCookieCleanup,
  getAuthSessionFromRequest,
  resolveAuthSessionIdentity,
} from "@/server/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authSession = await getAuthSessionFromRequest(request);
  const identity = resolveAuthSessionIdentity(authSession.session?.user);

  if (!identity) {
    return applyInvalidAuthSessionCookieCleanup(NextResponse.json({
      authenticated: false,
      user: null,
    }), authSession.invalidAuthSessionCookieNames);
  }

  return applyInvalidAuthSessionCookieCleanup(NextResponse.json({
    authenticated: true,
    user: {
      email: identity.email,
      displayName: identity.displayName,
    },
  }), authSession.invalidAuthSessionCookieNames);
}
