"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

type AuthSessionProviderProps = {
  children: ReactNode;
};

export function AuthSessionProvider({
  children,
}: AuthSessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
