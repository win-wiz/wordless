'use client';

import useSWR from "swr";

import { fetchAuthSession } from "@/lib/api";
import type { AuthSessionResponse } from "@/types/auth";

const AUTH_SESSION_KEY = "auth-session";

export function useAuthSession() {
  const swr = useSWR<AuthSessionResponse>(
    AUTH_SESSION_KEY,
    fetchAuthSession,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    ...swr,
    user: swr.data?.user ?? null,
    isAuthenticated: swr.data?.authenticated === true,
    isLoading: swr.isLoading,
  };
}

export async function refreshAuthSession() {
  const { mutate } = await import("swr");
  await mutate(AUTH_SESSION_KEY);
}

export async function logoutAndRefreshSession() {
  const { signOut } = await import("next-auth/react");
  await signOut({ redirect: false });
  await refreshAuthSession();
}
