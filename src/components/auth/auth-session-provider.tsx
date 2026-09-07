"use client";

import type { ReactNode } from "react";

type AuthSessionProviderProps = {
  children: ReactNode;
};

export function AuthSessionProvider({
  children,
}: AuthSessionProviderProps) {
  return <>{children}</>;
}
