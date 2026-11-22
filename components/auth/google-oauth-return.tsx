"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/landing/brand-mark";
import { completeGoogleSession } from "@/lib/auth/google";
import { setAuthTokens } from "@/lib/auth/tokens";

export function GoogleOAuthReturn() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in with Google…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    void completeGoogleSession().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setFailed(true);
        setMessage(result.message);
        return;
      }
      setAuthTokens(result.accessToken);
      router.replace(result.nextPath);
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-br from-primary-soft via-background to-background p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 text-center shadow-soft sm:p-8">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>
        {!failed ? (
          <>
            <div
              className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary"
              aria-hidden
            />
            <p className="font-medium text-foreground" role="status">
              {message}
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-xl font-semibold text-foreground">
              Could not sign in
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-[filter] hover:brightness-110"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
