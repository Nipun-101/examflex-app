"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleMark } from "@/components/auth/google-mark";
import { startGoogleSignIn } from "@/lib/auth/google";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/safe-redirect";
import { isAuthenticated } from "@/lib/auth/tokens";
import { APP_NAME } from "@/lib/constants";

export const GOOGLE_PROMPT_DISMISS_KEY = "examflex.google.prompt.dismissed";

export function GoogleSignInPrompt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    if (isAuthenticated()) return;
    if (sessionStorage.getItem(GOOGLE_PROMPT_DISMISS_KEY) === "1") return;

    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!open) return null;

  const dismiss = () => {
    sessionStorage.setItem(GOOGLE_PROMPT_DISMISS_KEY, "1");
    setOpen(false);
  };

  const continueWithGoogle = async () => {
    setError(null);
    setPending(true);
    try {
      await startGoogleSignIn(DEFAULT_POST_LOGIN_PATH);
    } catch {
      setPending(false);
      setError("Google sign-in could not be started. Try again in a moment.");
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 animate-fade-up sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[340px]">
      <div className="relative rounded-2xl border border-border bg-card p-4 shadow-soft">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss Google sign-in"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 pr-10">
          <GoogleMark size={22} />
          <p className="text-sm font-semibold leading-snug text-foreground">
            Sign in to {APP_NAME} with Google
          </p>
        </div>
        {error ? (
          <p className="mt-3 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void continueWithGoogle()}
          disabled={pending}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-soft transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Continuing…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
