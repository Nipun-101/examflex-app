"use client";

import { useState } from "react";
import { GoogleMark } from "@/components/auth/google-mark";
import { startGoogleSignIn } from "@/lib/auth/google";

export type GoogleSignInButtonProps = {
  disabled?: boolean;
  onError: (message: string) => void;
  className?: string;
};

export function GoogleSignInButton({
  disabled = false,
  onError,
  className = "",
}: GoogleSignInButtonProps) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      await startGoogleSignIn();
    } catch {
      setPending(false);
      onError(
        "Google sign-in could not be started. You can still use your mobile number."
      );
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || pending}
      className={`inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    >
      <GoogleMark />
      {pending ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}
