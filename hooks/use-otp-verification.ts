"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_OTP_SETTINGS,
  initOtpWidget,
  isCaptchaVerified,
  loadOtpScript,
  otpErrorMessage,
  readWidgetSettings,
  resendOtp,
  sendOtp,
  verifyOtpCode,
  waitForOtpMethods,
  type OtpWidgetSettings,
} from "@/lib/auth/otp-widget";

export type OtpVerifiedOutcome =
  | { ok: true }
  | {
      ok: false;
      message: string;
      /**
       * True when trying the same verified code again can help (for example a
       * network error on our side). False sends the learner back to the first
       * step, because the code is spent or the number/email cannot be used.
       */
      retryable: boolean;
    };

export type OtpBusy = "sending" | "verifying" | "finishing" | "resending" | null;

/** hCaptcha's "normal" checkbox is a fixed 303 x 78 widget, wider than a phone-width card. */
export const CAPTCHA_WIDTH = 304;
const CAPTCHA_HEIGHT = 78;
const CAPTCHA_MIN_SCALE = 0.5;

type UseOtpVerificationOptions = {
  /** Element the widget draws its human check into. One per page. */
  captchaElementId: string;
  /** Called with the MSG91 access token and the target (number or email). */
  onVerified: (accessToken: string, target: string) => Promise<OtpVerifiedOutcome>;
  /** MSG91 retry channel; null uses the widget's default. */
  resendChannel?: string | null;
};

/**
 * The MSG91 OTP flow shared by every OTP form: load and start the widget, fit
 * the human check into its card, send / verify / resend with a countdown, and
 * hand the access token to the caller. Every pixel stays with the caller.
 */
export function useOtpVerification({
  captchaElementId,
  onVerified,
  resendChannel = null,
}: UseOtpVerificationOptions) {
  const [widget, setWidget] = useState<"loading" | "ready" | "failed">(
    "loading"
  );
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [step, setStep] = useState<"start" | "code">("start");
  const [target, setTarget] = useState("");
  const [code, setCodeState] = useState("");
  const [busy, setBusy] = useState<OtpBusy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState<OtpWidgetSettings>(
    DEFAULT_OTP_SETTINGS
  );
  const [resendsUsed, setResendsUsed] = useState(0);
  const [nextResendAt, setNextResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const mounted = useRef(true);
  const captchaBoxRef = useRef<HTMLDivElement>(null);
  const captchaInnerRef = useRef<HTMLDivElement>(null);
  const [captchaFit, setCaptchaFit] = useState({
    scale: 1,
    height: CAPTCHA_HEIGHT,
  });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The human check cannot be resized, so shrink it to fit the space it is given
  // (a phone-width card is narrower than the widget). Centred, never wider than
  // the card, never larger than its natural size.
  useEffect(() => {
    const box = captchaBoxRef.current;
    const inner = captchaInnerRef.current;
    if (!box || !inner || typeof ResizeObserver === "undefined") return;

    const fit = () => {
      const available = box.clientWidth;
      if (available <= 0) return; // hidden: nothing to fit yet
      const scale = Math.max(
        CAPTCHA_MIN_SCALE,
        Math.min(1, available / CAPTCHA_WIDTH)
      );
      const height = (inner.offsetHeight || CAPTCHA_HEIGHT) * scale;
      setCaptchaFit((previous) =>
        previous.scale === scale && previous.height === height
          ? previous
          : { scale, height }
      );
    };

    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  // Start the widget (and restart it on "Try again").
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await loadOtpScript();
        if (cancelled) return;
        initOtpWidget(captchaElementId);
        await waitForOtpMethods();
        if (cancelled) return;
        setSettings(readWidgetSettings());
        setWidget("ready");
      } catch {
        if (!cancelled) setWidget("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt, captchaElementId]);

  // Tick once a second while a resend countdown is running.
  useEffect(() => {
    if (step !== "code" || nextResendAt <= Date.now()) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= nextResendAt) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, nextResendAt]);

  /** Re-render the captcha, which is spent after one use. */
  const resetWidget = useCallback(() => {
    try {
      initOtpWidget(captchaElementId);
    } catch {
      setWidget("failed");
    }
  }, [captchaElementId]);

  const backToStart = useCallback(
    (message: string | null) => {
      setStep("start");
      setCodeState("");
      setPendingToken(null);
      setNotice(null);
      setError(message);
      resetWidget();
    },
    [resetWidget]
  );

  const retryLoad = useCallback(() => {
    setWidget("loading");
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  /** Edit the code; any error from the previous attempt goes away. */
  function setCode(next: string) {
    setCodeState(next);
    if (error) setError(null);
  }

  /**
   * Send the first code to `identifier` (in MSG91's format). `display` is what
   * the learner sees and what `onVerified` receives. Resolves true when sent.
   */
  async function send(identifier: string, display: string): Promise<boolean> {
    if (busy || widget !== "ready") return false;

    setError(null);
    setNotice(null);
    setBusy("sending");
    try {
      await sendOtp(identifier);
    } catch (failure) {
      if (!mounted.current) return false;
      setBusy(null);
      setError(
        isCaptchaVerified() === false
          ? "Please tick “I am human”, then send the code again."
          : otpErrorMessage(
              failure,
              "We couldn’t send the code. Please try again."
            )
      );
      return false;
    }
    if (!mounted.current) return false;

    const latest = readWidgetSettings();
    setSettings(latest);
    setTarget(display);
    setCodeState("");
    setResendsUsed(0);
    const current = Date.now();
    setNow(current);
    setNextResendAt(current + latest.retryTimeSec * 1000);
    setBusy(null);
    setStep("code");
    return true;
  }

  async function finish(token: string, value: string) {
    setPendingToken(token);
    setBusy("finishing");
    setError(null);
    const outcome = await onVerified(token, value);
    if (!mounted.current) return;
    // On success stay in the "finishing" state: the parent is about to
    // navigate or replace this form, and it must not look clickable again.
    if (outcome.ok) return;
    setBusy(null);
    if (outcome.retryable) {
      setError(outcome.message);
      return;
    }
    backToStart(outcome.message);
  }

  async function verify(value: string) {
    if (busy || value.length !== settings.otpLength) return;
    setError(null);
    setNotice(null);
    setBusy("verifying");
    let token: string;
    try {
      token = await verifyOtpCode(value);
    } catch (failure) {
      if (!mounted.current) return;
      setBusy(null);
      setCodeState("");
      setError(
        otpErrorMessage(failure, "That code didn’t match. Please try again.")
      );
      return;
    }
    if (!mounted.current) return;
    await finish(token, target);
  }

  /** Hand the already-verified token to the caller again. */
  async function retryFinish() {
    if (pendingToken) await finish(pendingToken, target);
  }

  async function resend() {
    if (busy) return;
    setError(null);
    setNotice(null);
    setBusy("resending");
    try {
      await resendOtp(resendChannel);
    } catch (failure) {
      if (!mounted.current) return;
      setBusy(null);
      setError(
        otpErrorMessage(failure, "We couldn’t resend the code. Please try again.")
      );
      return;
    }
    if (!mounted.current) return;
    const current = Date.now();
    setNow(current);
    setNextResendAt(current + settings.retryTimeSec * 1000);
    setResendsUsed((used) => used + 1);
    setCodeState("");
    setBusy(null);
    setNotice("A new code is on its way.");
  }

  return {
    widget,
    retryLoad,
    step,
    target,
    code,
    setCode,
    busy,
    working: busy !== null,
    error,
    setError,
    notice,
    settings,
    pendingToken,
    secondsLeft: Math.max(0, Math.ceil((nextResendAt - now) / 1000)),
    resendsLeft: settings.retryCount - resendsUsed,
    send,
    verify,
    resend,
    retryFinish,
    backToStart,
    captchaBoxRef,
    captchaInnerRef,
    captchaFit,
  };
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
