"use client";

import { AlertCircle, ArrowLeft, Phone, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  MobileOtpForm,
  type OtpVerifiedOutcome,
} from "@/components/auth/mobile-otp-form";
import { BrandMark } from "@/components/landing/brand-mark";
import { lockBodyScroll } from "@/lib/study/body-scroll-lock";
import { verifyOtp } from "@/lib/api/auth";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import {
  getAuthToken,
  healAuthSessionCookies,
  setAuthTokens,
} from "@/lib/auth/tokens";
import { APP_NAME } from "@/lib/constants";

const loginButtonClass =
  "inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

const SIGN_IN_FAILED =
  "Something went wrong while completing sign-in. Please try again in a moment.";

function resolvePostLoginPath(): string {
  return getSafeRedirectPath(
    new URLSearchParams(window.location.search).get("redirect")
  );
}

export function LoginPanel() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [showMobileOtp, setShowMobileOtp] = useState(false);

  const close = () => {
    router.push("/");
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      healAuthSessionCookies();
      router.replace(resolvePostLoginPath());
    }
  }, [router]);

  useEffect(() => {
    const unlockScroll = lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close uses stable router
  }, [router]);

  /** MSG91 proved the number; exchange its token for an ExamFlex session. */
  async function handleOtpVerified(
    accessToken: string
  ): Promise<OtpVerifiedOutcome> {
    const result = await verifyOtp(accessToken);
    if (!result.ok) {
      // A network or server error says nothing about the code: retrying the
      // same verified code can work. A 4xx means this code cannot sign in.
      const transient = result.status === undefined || result.status >= 500;
      return {
        ok: false,
        retryable: transient,
        message: transient ? SIGN_IN_FAILED : result.message || SIGN_IN_FAILED,
      };
    }
    setAuthTokens(result.data.accessToken);
    router.replace(resolvePostLoginPath());
    return { ok: true };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close login"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-[400px] overflow-y-auto rounded-3xl border border-border/70 bg-card px-6 pb-6 pt-5 shadow-soft"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex flex-col items-center pt-2">
          <BrandMark className="mb-3" />
          <h1
            id="login-title"
            className="font-display text-xl font-semibold tracking-tight text-foreground"
          >
            Log in to {APP_NAME}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {showMobileOtp
              ? "We’ll text you a code to confirm it’s you."
              : "Continue with Google or your mobile number."}
          </p>
        </div>

        {notice ? (
          <div
            role="alert"
            className="mb-4 flex gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-foreground"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
              aria-hidden
            />
            <div>
              <p className="font-semibold">Could not verify</p>
              <p className="mt-0.5 text-muted-foreground">{notice}</p>
            </div>
          </div>
        ) : null}

        {showMobileOtp ? (
          <div>
            <MobileOtpForm
              theme="landing"
              onVerified={handleOtpVerified}
              sendLabel="Send code"
              finishingLabel="Signing you in…"
            />
            <button
              type="button"
              onClick={() => setShowMobileOtp(false)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Other ways to log in
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <GoogleSignInButton
              onError={(message) => setNotice(message)}
              className={loginButtonClass}
            />
            <button
              type="button"
              onClick={() => {
                setNotice(null);
                setShowMobileOtp(true);
              }}
              className={loginButtonClass}
            >
              <Phone className="h-4 w-4 text-foreground" aria-hidden />
              Continue with mobile number
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
