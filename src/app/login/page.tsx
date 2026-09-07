'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { useAuthSession } from "@/hooks/use-auth-session";

type ProviderId = "google" | "github";

function getRedirectTarget(rawRedirect: string | null) {
  if (!rawRedirect || !rawRedirect.startsWith("/")) {
    return "/";
  }

  return rawRedirect;
}

const providerMeta: Record<
  ProviderId,
  {
    label: string;
    icon: ReactNode;
    className: string;
  }
> = {
  google: {
    label: "Continue with Google",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285F4] text-[11px] font-bold text-white">
        G
      </span>
    ),
    className:
      "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50",
  },
  github: {
    label: "Continue with GitHub",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[11px] font-bold text-white">
        GH
      </span>
    ),
    className:
      "border-zinc-900 bg-zinc-900 text-white hover:bg-black",
  },
};

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
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(null);
  const redirectTarget = useMemo(
    () => getRedirectTarget(searchParams.get("redirect")),
    [searchParams],
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  const handleSSOLogin = async (providerId: ProviderId) => {
    setPendingProvider(providerId);

    try {
      await signIn(providerId, { redirectTo: redirectTarget });
    } catch (error) {
      console.error("start sso login error:", error);
      setPendingProvider(null);
      toast.error(
        error instanceof Error ? error.message : "Couldn't start sign-in. Please try again.",
      );
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-[0_20px_60px_rgba(139,92,246,0.12)]">
        <Link
          href={redirectTarget}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to game
        </Link>

        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-500">
            Wordless Account
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
            Sign in with Google or GitHub
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Sign in to save your Daily Challenge progress automatically. Right now, we support Google and GitHub.
          </p>
        </div>

        <div className="space-y-3">
          {(Object.keys(providerMeta) as ProviderId[]).map((providerId) => {
            const meta = providerMeta[providerId];
            const isPending = pendingProvider === providerId;

            return (
              <button
                key={providerId}
                type="button"
                onClick={() => handleSSOLogin(providerId)}
                disabled={Boolean(pendingProvider)}
                className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${meta.className}`}
              >
                {isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  meta.icon
                )}
                <span>{isPending ? "Redirecting..." : meta.label}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          By signing in, you agree to our
          {" "}
          <Link href="/terms-of-service" className="font-semibold text-violet-600 hover:text-violet-700">
            Terms of Service
          </Link>
          {" "}
          and
          {" "}
          <Link href="/privacy-policy" className="font-semibold text-violet-600 hover:text-violet-700">
            Privacy Policy
          </Link>
          .
        </p>
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
