"use client";

import { AlertCircle, Phone, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { BrandMark } from "@/components/landing/brand-mark";
import { verifyOtp } from "@/lib/api/auth";
import {
  extractMsg91AccessToken,
  isOtpCancelled,
  otpErrorMessage,
  type Msg91WidgetConfig,
} from "@/lib/auth/otp-widget";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import {
  getAuthToken,
  healAuthSessionCookies,
  setAuthTokens,
} from "@/lib/auth/tokens";
import { APP_NAME } from "@/lib/constants";

const loginButtonClass =
  "inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

function resolvePostLoginPath(): string {
  return getSafeRedirectPath(
    new URLSearchParams(window.location.search).get("redirect")
  );
}

export function LoginPanel() {
  const router = useRouter();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [widgetNotice, setWidgetNotice] = useState<string | null>(null);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const getOtpWidgetConfig = (): Msg91WidgetConfig => ({
    widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
    tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
    identifier: "",
    exposeMethods: false,
    success: (data: unknown) => {
      void (async () => {
        setWidgetNotice(null);
        setIsVerifying(true);

        try {
          const accessToken = extractMsg91AccessToken(data);
          if (!accessToken) {
            setWidgetNotice(
              "We could not finish sign-in from that OTP. Please try again."
            );
            setIsVerifying(false);
            return;
          }

          const result = await verifyOtp(accessToken);
          if (!result.ok) {
            throw new Error(result.message);
          }

          setAuthTokens(
            result.data.accessToken,
            result.data.refreshToken ?? null,
            result.data.expiresIn
          );
          router.replace(resolvePostLoginPath());
        } catch {
          setWidgetNotice(
            "Something went wrong while completing sign-in. Please try verifying again in a moment."
          );
          setIsVerifying(false);
        }
      })();
    },
    failure: (error: unknown) => {
      setIsVerifying(false);
      setShowMobileOtp(false);
      setWidgetNotice(isOtpCancelled(error) ? null : otpErrorMessage(error));
    },
  });

  const mountOtpWidget = () => {
    if (typeof window.initSendOTP === "function") {
      window.initSendOTP(getOtpWidgetConfig());
    }
  };

  const mountOtpWidgetRef = useRef(mountOtpWidget);
  mountOtpWidgetRef.current = mountOtpWidget;

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close uses stable router
  }, [router]);

  useEffect(() => {
    if (!showMobileOtp) {
      return;
    }

    const mountExisting = () => {
      if (typeof window.initSendOTP === "function") {
        setIsScriptLoaded(true);
        mountOtpWidgetRef.current();
        return true;
      }
      return false;
    };

    if (mountExisting()) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://verify.msg91.com/otp-provider.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      mountOtpWidgetRef.current();
    };
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      script.remove();
      scriptRef.current = null;
      setIsScriptLoaded(false);
    };
  }, [showMobileOtp]);

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
        className="relative z-10 w-full max-w-[400px] rounded-3xl border border-border/70 bg-card px-6 pb-6 pt-5 shadow-soft"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {isVerifying ? (
          <div className="py-10 text-center">
            <div
              className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary"
              aria-hidden
            />
            <p className="text-sm font-medium text-foreground" role="status">
              Verifying your account...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col items-center pt-2">
              <BrandMark className="mb-3" />
              <h1
                id="login-title"
                className="font-display text-xl font-semibold tracking-tight text-foreground"
              >
                Log in to {APP_NAME}
              </h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Continue with Google or your mobile number.
              </p>
            </div>

            {widgetNotice ? (
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
                  <p className="mt-0.5 text-muted-foreground">{widgetNotice}</p>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <GoogleSignInButton
                disabled={isVerifying}
                onError={(message) => setWidgetNotice(message)}
                className={loginButtonClass}
              />
              <button
                type="button"
                onClick={() => {
                  setWidgetNotice(null);
                  setShowMobileOtp(true);
                }}
                className={loginButtonClass}
              >
                <Phone className="h-4 w-4 text-foreground" aria-hidden />
                Continue with mobile number
              </button>
            </div>

            {showMobileOtp ? (
              <div className="mt-4">
                <div id="msg91-otp-widget">
                  {!isScriptLoaded ? (
                    <div className="py-3 text-center">
                      <div
                        className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
                        aria-hidden
                      />
                      <p className="sr-only">Loading phone verification</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
