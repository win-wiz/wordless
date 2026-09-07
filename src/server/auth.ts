import type { Client } from "@libsql/client";
import type { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { randomHex, randomUuid, sha256Hex } from "@/server/edge-crypto";
import type { AuthUser } from "@/types/auth";

const VISITOR_SESSION_COOKIE_NAME = "wordless_visitor_session";
const VISITOR_SESSION_TTL_DAYS = 30;
const VISITOR_SESSION_TOUCH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];
const RECOVERABLE_AUTH_SESSION_ERROR_NAMES = new Set([
  "JWTSessionError",
  "JWEInvalid",
]);
const RECOVERABLE_AUTH_SESSION_ERROR_MESSAGES = [
  "Invalid Compact JWE",
  "JWTSessionError",
];

type AuthenticatedProfile = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
  provider?: string;
  providerAccountId?: string;
};

export type ResolvedAuthSessionIdentity = {
  displayName: string;
  email: string;
  provider?: string;
  providerAccountId?: string;
};

type AuthSession = {
  user?: AuthenticatedProfile | null;
} | null;

type RequestAuthSession = {
  session: AuthSession | null;
  invalidAuthSessionCookieNames: string[];
};

function normalizeDisplayName(user: AuthenticatedProfile) {
  const normalizedEmail = user.email?.trim();

  return (
    user.name?.trim().slice(0, 40) ||
    normalizedEmail?.split("@")[0]?.slice(0, 40) ||
    "Wordless Player"
  );
}

function buildFallbackEmail(user: AuthenticatedProfile) {
  const provider = user.provider?.trim().toLowerCase() || "oauth";
  const providerAccountId =
    user.providerAccountId?.trim().toLowerCase() || randomUuid();
  const localPart = `${provider}-${providerAccountId}`
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return `${localPart || randomUuid()}@users.wordless.local`;
}

export function resolveAuthSessionIdentity(
  user?: AuthenticatedProfile | null,
): ResolvedAuthSessionIdentity | null {
  const email = user?.email?.trim().toLowerCase();
  const provider = user?.provider?.trim().toLowerCase();
  const providerAccountId = user?.providerAccountId?.trim();

  if (!email && !(provider && providerAccountId)) {
    return null;
  }

  const normalizedUser = {
    ...user,
    email: email ?? undefined,
    provider,
    providerAccountId,
  };
  const resolvedEmail = email ?? buildFallbackEmail(normalizedUser);

  return {
    email: resolvedEmail,
    displayName: normalizeDisplayName({
      ...normalizedUser,
      email: resolvedEmail,
    }),
    provider: provider ?? undefined,
    providerAccountId: providerAccountId ?? undefined,
  };
}

function buildVisitorEmail(userId: string) {
  return `visitor-${userId}@visitors.wordless.local`;
}

function buildVisitorSessionExpiry() {
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + VISITOR_SESSION_TTL_DAYS);
  return expiresAt.toISOString();
}

function hashSessionToken(token: string) {
  return sha256Hex(token);
}

async function createVisitorUser(client: Client) {
  const userId = randomUuid();
  const sessionId = randomUuid();
  const sessionToken = randomHex(32);
  const expiresAt = buildVisitorSessionExpiry();
  const createdAt = new Date().toISOString();
  const email = buildVisitorEmail(userId);
  const sessionTokenHash = await hashSessionToken(sessionToken);

  await client.batch(
    [
      {
        sql: `
          INSERT INTO app_users (
            id,
            email,
            password_hash,
            display_name,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        args: [
          userId,
          email,
          "visitor:anonymous",
          "Guest Player",
        ],
      },
      {
        sql: `
          INSERT INTO visitor_sessions (
            id,
            user_id,
            session_token_hash,
            expires_at,
            created_at,
            last_seen_at
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        args: [
          sessionId,
          userId,
          sessionTokenHash,
          expiresAt,
        ],
      },
    ],
    "write",
  );

  return {
    sessionToken,
    expiresAt,
    user: {
      id: userId,
      email,
      displayName: "Guest Player",
      createdAt,
    } satisfies AuthUser,
  };
}

async function getVisitorUserBySessionToken(
  client: Client,
  token: string,
) {
  const sessionTokenHash = await hashSessionToken(token);
  const result = await client.execute({
    sql: `
      SELECT
        vs.id AS session_id,
        vs.expires_at,
        u.id,
        u.email,
        u.display_name,
        u.created_at
      FROM visitor_sessions vs
      INNER JOIN app_users u
        ON u.id = vs.user_id
      WHERE vs.session_token_hash = ?
        AND vs.expires_at > ?
      LIMIT 1
    `,
    args: [sessionTokenHash, new Date().toISOString()],
  });

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    sessionId: String(row.session_id),
    expiresAt: String(row.expires_at),
    user: {
      id: String(row.id),
      email: String(row.email),
      displayName: String(row.display_name),
      createdAt: String(row.created_at),
    } satisfies AuthUser,
  };
}

function shouldRefreshVisitorSession(expiresAt: string) {
  const expiresAtMs = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiresAtMs)) {
    return true;
  }

  return expiresAtMs - Date.now() <= VISITOR_SESSION_TOUCH_THRESHOLD_MS;
}

async function touchVisitorSession(
  client: Client,
  sessionId: string,
  expiresAt: string,
) {
  await client.execute({
    sql: `
      UPDATE visitor_sessions
      SET
        expires_at = ?,
        last_seen_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    args: [expiresAt, sessionId],
  });
}

async function getLocalUserIdForProfile(
  client: Client,
  user: AuthenticatedProfile,
) {
  if (user.provider && user.providerAccountId) {
    const accountResult = await client.execute({
      sql: `
        SELECT user_id
        FROM auth_accounts
        WHERE provider = ?
          AND provider_account_id = ?
        LIMIT 1
      `,
      args: [user.provider, user.providerAccountId],
    });
    const userId = accountResult.rows[0]?.user_id;

    if (userId) {
      return String(userId);
    }
  }

  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const existingUserResult = await client.execute({
    sql: `
      SELECT id
      FROM app_users
      WHERE email = ?
      LIMIT 1
    `,
    args: [normalizedEmail],
  });

  return existingUserResult.rows[0]?.id
    ? String(existingUserResult.rows[0].id)
    : null;
}

async function syncAuthAccount(
  client: Client,
  userId: string,
  user: AuthenticatedProfile,
) {
  if (!user.provider || !user.providerAccountId) {
    return;
  }

  await client.execute({
    sql: `
      INSERT INTO auth_accounts (
        id,
        user_id,
        provider,
        provider_account_id,
        provider_email,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(provider, provider_account_id) DO UPDATE SET
        user_id = excluded.user_id,
        provider_email = excluded.provider_email,
        updated_at = CURRENT_TIMESTAMP
    `,
    args: [
      randomUuid(),
      userId,
      user.provider,
      user.providerAccountId,
      user.email?.trim().toLowerCase() ?? null,
    ],
  });
}

async function syncOAuthUser(client: Client, user: AuthenticatedProfile) {
  const normalizedEmail = user.email?.trim().toLowerCase() || buildFallbackEmail(user);
  const displayName = normalizeDisplayName(user);
  const localUserId = (await getLocalUserIdForProfile(client, user)) || randomUuid();

  await client.execute({
    sql: `
      INSERT INTO app_users (
        id,
        email,
        password_hash,
        display_name,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        display_name = excluded.display_name,
        updated_at = CURRENT_TIMESTAMP
    `,
    args: [
      localUserId,
      normalizedEmail,
      `oauth:${user.provider ?? "oauth"}`,
      displayName,
    ],
  });

  await syncAuthAccount(client, localUserId, user);

  const result = await client.execute({
    sql: `
      SELECT
        id,
        email,
        display_name,
        created_at
      FROM app_users
      WHERE id = ?
      LIMIT 1
    `,
    args: [localUserId],
  });

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    createdAt: String(row.created_at),
  } satisfies AuthUser;
}

function hasAuthSessionCookie(request?: NextRequest) {
  if (!request) {
    return true;
  }

  const requestCookieNames = request.cookies.getAll().map(({ name }) => name);

  return AUTH_SESSION_COOKIE_NAMES.some((cookieName) =>
    requestCookieNames.some(
      (requestCookieName) =>
        requestCookieName === cookieName ||
        requestCookieName.startsWith(`${cookieName}.`),
    ),
  );
}

function collectAuthSessionCookieNames(request?: NextRequest) {
  if (!request) {
    return [...AUTH_SESSION_COOKIE_NAMES];
  }

  const requestCookieNames = request.cookies.getAll().map(({ name }) => name);
  const matchingCookieNames = requestCookieNames.filter((requestCookieName) =>
    AUTH_SESSION_COOKIE_NAMES.some((cookieName) =>
      requestCookieName === cookieName ||
      requestCookieName.startsWith(`${cookieName}.`),
    ),
  );

  return matchingCookieNames.length > 0
    ? matchingCookieNames
    : [...AUTH_SESSION_COOKIE_NAMES];
}

function isRecoverableAuthSessionError(error: unknown) {
  let current: unknown = error;

  for (let depth = 0; depth < 3; depth += 1) {
    if (!current) {
      return false;
    }

    if (typeof current === "string") {
      const currentMessage = current;

      return RECOVERABLE_AUTH_SESSION_ERROR_MESSAGES.some((message) =>
        currentMessage.includes(message),
      );
    }

    if (typeof current !== "object") {
      return false;
    }

    const candidate = current as {
      cause?: unknown;
      message?: unknown;
      name?: unknown;
    };
    const errorName =
      typeof candidate.name === "string" ? candidate.name : "";
    const errorMessage =
      typeof candidate.message === "string" ? candidate.message : "";

    if (
      RECOVERABLE_AUTH_SESSION_ERROR_NAMES.has(errorName) ||
      RECOVERABLE_AUTH_SESSION_ERROR_MESSAGES.some((message) =>
        errorMessage.includes(message),
      )
    ) {
      return true;
    }

    current = candidate.cause;
  }

  return false;
}

export async function getAuthSessionFromRequest(
  request?: NextRequest,
): Promise<RequestAuthSession> {
  if (!hasAuthSessionCookie(request)) {
    return {
      session: null,
      invalidAuthSessionCookieNames: [],
    };
  }

  try {
    return {
      session: (await auth()) as AuthSession,
      invalidAuthSessionCookieNames: [],
    };
  } catch (error) {
    if (!isRecoverableAuthSessionError(error)) {
      throw error;
    }

    return {
      session: null,
      invalidAuthSessionCookieNames: collectAuthSessionCookieNames(request),
    };
  }
}

export async function getCurrentUserStateFromRequest(
  client: Client,
  request?: NextRequest,
) {
  const authSession = await getAuthSessionFromRequest(request);
  const identity = resolveAuthSessionIdentity(authSession.session?.user);

  if (!identity) {
    return {
      user: null,
      invalidAuthSessionCookieNames: authSession.invalidAuthSessionCookieNames,
    };
  }

  return {
    user: await syncOAuthUser(client, {
      email: identity.email,
      name: authSession.session?.user?.name ?? undefined,
      provider: identity.provider,
      providerAccountId: identity.providerAccountId,
    }),
    invalidAuthSessionCookieNames: authSession.invalidAuthSessionCookieNames,
  };
}

export async function getCurrentUserFromRequest(
  client: Client,
  request?: NextRequest,
) {
  const authState = await getCurrentUserStateFromRequest(client, request);

  return authState.user;
}

type RequestPlayer = {
  user: AuthUser | null;
  authenticated: boolean;
  visitorSessionToken: string | null;
  visitorSessionExpiresAt: string | null;
  invalidAuthSessionCookieNames: string[];
};

export async function getPlayerFromRequest(
  client: Client,
  request: NextRequest,
  options?: {
    createVisitorIfMissing?: boolean;
  },
): Promise<RequestPlayer> {
  const authState = await getCurrentUserStateFromRequest(client, request);
  const authenticatedUser = authState.user;

  if (authenticatedUser) {
    return {
      user: authenticatedUser,
      authenticated: true,
      visitorSessionToken: null,
      visitorSessionExpiresAt: null,
      invalidAuthSessionCookieNames: authState.invalidAuthSessionCookieNames,
    };
  }

  const sessionToken = request.cookies.get(VISITOR_SESSION_COOKIE_NAME)?.value?.trim();

  if (sessionToken) {
    const visitorSession = await getVisitorUserBySessionToken(client, sessionToken);

    if (visitorSession) {
      const expiresAt = shouldRefreshVisitorSession(visitorSession.expiresAt)
        ? buildVisitorSessionExpiry()
        : visitorSession.expiresAt;

      if (expiresAt !== visitorSession.expiresAt) {
        await touchVisitorSession(client, visitorSession.sessionId, expiresAt);
      }

      return {
        user: visitorSession.user,
        authenticated: false,
        visitorSessionToken: sessionToken,
        visitorSessionExpiresAt: expiresAt,
        invalidAuthSessionCookieNames: authState.invalidAuthSessionCookieNames,
      };
    }
  }

  if (!options?.createVisitorIfMissing) {
    return {
      user: null,
      authenticated: false,
      visitorSessionToken: null,
      visitorSessionExpiresAt: null,
      invalidAuthSessionCookieNames: authState.invalidAuthSessionCookieNames,
    };
  }

  const visitorSession = await createVisitorUser(client);

  return {
    user: visitorSession.user,
    authenticated: false,
    visitorSessionToken: visitorSession.sessionToken,
    visitorSessionExpiresAt: visitorSession.expiresAt,
    invalidAuthSessionCookieNames: authState.invalidAuthSessionCookieNames,
  };
}

export function applyInvalidAuthSessionCookieCleanup(
  response: NextResponse,
  invalidAuthSessionCookieNames: string[],
) {
  for (const cookieName of new Set(invalidAuthSessionCookieNames)) {
    response.cookies.set({
      name: cookieName,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure:
        cookieName.startsWith("__Secure-") ||
        process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });
  }

  return response;
}

export function applyVisitorSessionCookie(
  response: NextResponse,
  player: RequestPlayer,
) {
  applyInvalidAuthSessionCookieCleanup(
    response,
    player.invalidAuthSessionCookieNames,
  );

  if (
    player.authenticated ||
    !player.visitorSessionToken ||
    !player.visitorSessionExpiresAt
  ) {
    return response;
  }

  response.cookies.set({
    name: VISITOR_SESSION_COOKIE_NAME,
    value: player.visitorSessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(player.visitorSessionExpiresAt),
  });

  return response;
}
