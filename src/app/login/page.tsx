'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

import {
  AuthLoginPanel,
  getAuthRedirectTarget,
} from "@/components/auth/auth-login-panel";
import { useAuthSession } from "@/hooks/use-auth-session";

function LoginCardSkeleton() {
  return (
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-[0_20px_60px_rgba(139,92,246,0.12)]">
        <div className="mb-6 h-5 w-28 rounded bg-violet-100" />
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto h-4 w-28 rounded bg-violet-100" />
          <div className="mx-auto h-9 w-72 rounded bg-zinc-100" />
          <div className="mx-auto h-4 w-80 rounded bg-zinc-100" />
        </div>
        <div className="space-y-3">
          <div className="h-12 rounded-xl bg-zinc-100" />
          <div className="h-12 rounded-xl bg-zinc-100" />
        </div>
      </div>
    </main>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthSession();
  const redirectTarget = useMemo(
    () => getAuthRedirectTarget(searchParams.get("redirect")),
    [searchParams],
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  return (
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <AuthLoginPanel redirectTarget={redirectTarget} showBackLink />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginCardSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
