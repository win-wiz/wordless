"use client";

import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

type ProviderId = "google" | "github";

export function getAuthRedirectTarget(rawRedirect: string | null | undefined) {
  const redirectTarget = rawRedirect?.trim();

  if (
    !redirectTarget
    || !redirectTarget.startsWith("/")
    || redirectTarget.startsWith("//")
  ) {
    return "/";
  }

  return redirectTarget;
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
    label: "Google",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
      >
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.88c2.27-2.09 3.55-5.16 3.55-8.65Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3c-1.08.73-2.46 1.17-4.05 1.17-3.11 0-5.74-2.1-6.68-4.92H1.31v3.09A11.99 11.99 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.32 14.34A7.2 7.2 0 0 1 4.95 12c0-.81.14-1.6.37-2.34V6.57H1.31A11.99 11.99 0 0 0 0 12c0 1.93.46 3.76 1.31 5.43l4.01-3.09Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.94 1.2 15.23 0 12 0 7.31 0 3.27 2.69 1.31 6.57l4.01 3.09c.94-2.82 3.57-4.89 6.68-4.89Z"
        />
      </svg>
    ),
    className:
      "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50",
  },
  github: {
    label: "GitHub",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 fill-current"
      >
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.11.79-.25.79-.56 0-.28-.01-1.2-.02-2.18-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.27 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.19 1.18a11.1 11.1 0 0 1 5.8 0c2.22-1.49 3.19-1.18 3.19-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.03.78 2.08 0 1.5-.01 2.7-.01 3.07 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
    className:
      "border-zinc-900 bg-zinc-900 text-white hover:bg-black",
  },
};

type AuthLoginPanelProps = {
  redirectTarget: string;
  showBackLink?: boolean;
  titleId?: string;
  descriptionId?: string;
};

export function AuthLoginPanel({
  redirectTarget,
  showBackLink = false,
  titleId,
  descriptionId,
}: AuthLoginPanelProps) {
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(null);

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
    <div className="w-full rounded-[32px] border border-violet-100 bg-white px-8 pb-8 pt-9 shadow-[0_20px_60px_rgba(139,92,246,0.12)]">
      {showBackLink ? (
        <Link
          href={redirectTarget}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to game
        </Link>
      ) : null}

      <div className="mb-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-violet-500">
          Sign In
        </p>
          <h1
            id={titleId}
            className="mt-3 text-[2.2rem] font-bold tracking-[-0.04em] text-zinc-900"
          >
          Continue to Wordless
        </h1>
          <p
            id={descriptionId}
            className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-zinc-500"
          >
          Save your Daily Challenge progress and keep your account in sync across devices.
        </p>
      </div>

      <div className="space-y-3.5">
        {(Object.keys(providerMeta) as ProviderId[]).map((providerId) => {
          const meta = providerMeta[providerId];
          const isPending = pendingProvider === providerId;

          return (
            <button
              key={providerId}
              type="button"
              onClick={() => handleSSOLogin(providerId)}
              disabled={Boolean(pendingProvider)}
              aria-label={isPending ? `${meta.label} loading` : meta.label}
              className={`flex h-14 w-full items-center justify-center gap-3 rounded-2xl border text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${meta.className}`}
            >
              {isPending ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                meta.icon
              )}
              {!isPending ? <span>{meta.label}</span> : null}
            </button>
          );
        })}
      </div>

      <p className="mx-auto mt-7 max-w-sm text-center text-sm leading-6 text-zinc-500">
        By continuing, you agree to our{" "}
        <Link
          href="/terms-of-service"
          className="font-semibold text-violet-600 hover:text-violet-700"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy-policy"
          className="font-semibold text-violet-600 hover:text-violet-700"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
