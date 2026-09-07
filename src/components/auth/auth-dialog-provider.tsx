"use client";

import {
  createContext,
  useEffect,
  useId,
  useRef,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  AuthLoginPanel,
  getAuthRedirectTarget,
} from "@/components/auth/auth-login-panel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type OpenLoginDialogOptions = {
  redirect?: string | null;
};

type AuthDialogContextValue = {
  openLoginDialog: (options?: OpenLoginDialogOptions) => void;
  closeLoginDialog: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

function getCurrentRedirectFromWindow() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}`;
}

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState("/");
  const titleId = useId();
  const descriptionId = useId();
  const lastPathnameRef = useRef(pathname);

  const openLoginDialog = useCallback(
    (options?: OpenLoginDialogOptions) => {
      setRedirectTarget(
        getAuthRedirectTarget(options?.redirect ?? getCurrentRedirectFromWindow()),
      );
      setIsOpen(true);
    },
    [],
  );

  const closeLoginDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      setIsOpen(false);
    }
  }, [pathname]);

  return (
    <AuthDialogContext.Provider value={{ openLoginDialog, closeLoginDialog }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          className="max-w-[min(92vw,30rem)] border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:bg-white/95 [&>button]:p-1.5 [&>button]:text-zinc-500 [&>button]:shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
        >
          <AuthLoginPanel
            redirectTarget={redirectTarget}
            titleId={titleId}
            descriptionId={descriptionId}
          />
        </DialogContent>
      </Dialog>
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);

  if (!context) {
    throw new Error("useAuthDialog must be used within AuthDialogProvider");
  }

  return context;
}
