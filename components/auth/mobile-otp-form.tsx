"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OtpCodeInput } from "@/components/auth/otp-code-input";
import {
  DEFAULT_OTP_SETTINGS,
  initOtpWidget,
  isCaptchaVerified,
  loadOtpScript,
  otpErrorMessage,
  readWidgetSettings,
  resendOtp,
  sendOtp,
  toWidgetIdentifier,
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
       * network error on our side). False sends the learner back to the number
       * step, because the code is spent or the number cannot be used.
       */
      retryable: boolean;
    };

type MobileOtpFormProps = {
  /** Called once with the MSG91 access token and the 10-digit number. */
  onVerified: (
    accessToken: string,
    mobile: string
  ) => Promise<OtpVerifiedOutcome>;
  theme: "landing" | "study";
  initialMobile?: string;
  sendLabel?: string;
  finishingLabel?: string;
};

const CAPTCHA_ELEMENT_ID = "msg91-captcha";
/** hCaptcha's "normal" checkbox is a fixed 303 x 78 widget, wider than a phone-width card. */
const CAPTCHA_WIDTH = 304;
const CAPTCHA_HEIGHT = 78;
const CAPTCHA_MIN_SCALE = 0.5;
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

type Theme = {
  label: string;
  input: string;
  prefix: string;
  primary: string;
  secondary: string;
  link: string;
  muted: string;
  error: string;
  notice: string;
  slot: string;
  slotActive: string;
  spinner: string;
};

const THEMES: Record<MobileOtpFormProps["theme"], Theme> = {
  landing: {
    label: "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
    input:
      "h-11 min-w-0 flex-1 rounded-r-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    prefix:
      "inline-flex h-11 items-center rounded-l-xl border border-r-0 border-border bg-muted px-3 text-sm font-medium text-foreground",
    primary:
      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60",
    secondary:
      "inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
    link: "text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60",
    muted: "text-sm text-muted-foreground",
    error: "text-sm text-destructive",
    notice: "text-sm text-primary",
    slot: "border-border bg-card text-foreground",
    slotActive: "border-primary bg-card text-foreground ring-2 ring-primary/30",
    spinner: "border-current/30 border-t-current",
  },
  study: {
    label:
      "text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase",
    input:
      "h-12 min-w-0 flex-1 rounded-r-[10px] border border-study-divider bg-study-canvas px-3 text-sm text-study-ink placeholder:text-study-muted-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green",
    prefix:
      "inline-flex h-12 items-center rounded-l-[10px] border border-r-0 border-study-divider bg-study-mint px-3 text-sm font-semibold text-study-ink",
    primary:
      "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-study-ink px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
    secondary:
      "inline-flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-study-divider bg-white px-4 text-sm font-medium text-study-green hover:bg-study-mint disabled:cursor-not-allowed disabled:opacity-40",
    link: "cursor-pointer text-sm font-medium text-study-green hover:underline disabled:cursor-not-allowed disabled:opacity-40",
    muted: "text-sm text-study-muted-soft",
    error: "text-sm text-study-peach-ink",
    notice: "text-sm text-study-green",
    slot: "border-study-divider bg-white text-study-ink",
    slotActive:
      "border-study-green bg-white text-study-ink ring-2 ring-study-green/25",
    spinner: "border-white/40 border-t-white",
  },
};

type Busy = "sending" | "verifying" | "finishing" | "resending" | null;

/** 9977898899 → "99778 98899" */
function groupMobile(mobile: string): string {
  return mobile.length === 10 ? `${mobile.slice(0, 5)} ${mobile.slice(5)}` : mobile;
}

/** Accept pasted "+91 98765 43210", "098765 43210" and plain 10 digits. */
export function normalizeMobile(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MobileOtpForm({
  onVerified,
  theme,
  initialMobile = "",
  sendLabel = "Send code",
  finishingLabel = "Finishing up…",
}: MobileOtpFormProps) {
  const t = THEMES[theme];

  const [widget, setWidget] = useState<"loading" | "ready" | "failed">(
    "loading"
  );
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [mobileInput, setMobileInput] = useState(initialMobile);
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
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
        initOtpWidget(CAPTCHA_ELEMENT_ID);
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
  }, [loadAttempt]);

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
      initOtpWidget(CAPTCHA_ELEMENT_ID);
    } catch {
      setWidget("failed");
    }
  }, []);

  const backToNumber = useCallback(
    (message: string | null) => {
      setStep("phone");
      setCode("");
      setPendingToken(null);
      setNotice(null);
      setError(message);
      resetWidget();
    },
    [resetWidget]
  );

  async function handleSend() {
    if (busy || widget !== "ready") return;

    const digits = normalizeMobile(mobileInput);
    if (!INDIAN_MOBILE.test(digits)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setNotice(null);
    setBusy("sending");
    try {
      await sendOtp(toWidgetIdentifier(digits));
    } catch (failure) {
      if (!mounted.current) return;
      setBusy(null);
      setError(
        isCaptchaVerified() === false
          ? "Please tick “I am human”, then send the code again."
          : otpErrorMessage(
              failure,
              "We couldn’t send the code. Please try again."
            )
      );
      return;
    }
    if (!mounted.current) return;

    const latest = readWidgetSettings();
    setSettings(latest);
    setMobile(digits);
    setMobileInput(digits);
    setCode("");
    setResendsUsed(0);
    const current = Date.now();
    setNow(current);
    setNextResendAt(current + latest.retryTimeSec * 1000);
    setBusy(null);
    setStep("code");
  }

  async function finish(token: string, digits: string) {
    setPendingToken(token);
    setBusy("finishing");
    setError(null);
    const outcome = await onVerified(token, digits);
    if (!mounted.current) return;
    // On success stay in the "finishing" state: the parent is about to
    // navigate or replace this form, and it must not look clickable again.
    if (outcome.ok) return;
    setBusy(null);
    if (outcome.retryable) {
      setError(outcome.message);
      return;
    }
    backToNumber(outcome.message);
  }

  async function handleVerify(value: string) {
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
      setCode("");
      setError(
        otpErrorMessage(failure, "That code didn’t match. Please try again.")
      );
      return;
    }
    if (!mounted.current) return;
    await finish(token, mobile);
  }

  async function handleResend() {
    if (busy) return;
    setError(null);
    setNotice(null);
    setBusy("resending");
    try {
      await resendOtp();
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
    setCode("");
    setBusy(null);
    setNotice("A new code is on its way.");
  }

  const secondsLeft = Math.max(0, Math.ceil((nextResendAt - now) / 1000));
  const resendsLeft = settings.retryCount - resendsUsed;
  const working = busy !== null;

  const spinner = (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 ${t.spinner}`}
      aria-hidden
    />
  );

  const showPhone = widget !== "failed" && step === "phone";
  const showCode = widget !== "failed" && step === "code";

  return (
    <div className="flex flex-col gap-4">
      {widget === "failed" ? (
        <div className="space-y-3" role="alert">
          <p className={t.error}>
            We couldn’t load phone verification. Check your connection and try
            again.
          </p>
          <button
            type="button"
            className={t.secondary}
            onClick={() => {
              setWidget("loading");
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      {showPhone ? (
        // Deliberately not a <form>: this component also lives inside the
        // onboarding form, and forms cannot be nested.
        <div className="space-y-1.5">
          <label htmlFor="otp-mobile" className={t.label}>
            Mobile number
          </label>
          <div className="flex">
            <span className={t.prefix} aria-hidden>
              +91
            </span>
            <input
              id="otp-mobile"
              name="mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={mobileInput}
              disabled={working}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "otp-error" : undefined}
              onChange={(event) => {
                setMobileInput(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                // Send the code, and never let Enter submit a parent form.
                event.preventDefault();
                void handleSend();
              }}
              className={t.input}
            />
          </div>
        </div>
      ) : null}

      {/*
        The widget draws its human check here: between the number and the
        button, like MSG91's own widget, and scaled down to fit a narrow card.
        Always mounted (only hidden) because MSG91 keeps a reference to it.
      */}
      <div
        ref={captchaBoxRef}
        className={showPhone ? "relative w-full overflow-hidden" : "hidden"}
        style={{ height: captchaFit.height }}
      >
        <div
          ref={captchaInnerRef}
          id={CAPTCHA_ELEMENT_ID}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: CAPTCHA_WIDTH,
            transform: `translateX(-50%) scale(${captchaFit.scale})`,
            transformOrigin: "top center",
          }}
        />
      </div>

      {showPhone ? (
        <>
          {error ? (
            <p id="otp-error" role="alert" className={t.error}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleSend()}
            className={t.primary}
            disabled={working || widget !== "ready"}
          >
            {busy === "sending" ? (
              <>
                {spinner}
                Sending code…
              </>
            ) : widget === "loading" ? (
              <>
                {spinner}
                Getting ready…
              </>
            ) : (
              sendLabel
            )}
          </button>
        </>
      ) : null}

      {showCode ? (
        <div className="space-y-4">
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium">
              Enter the {settings.otpLength}-digit code
            </p>
            <p className={t.muted}>
              Sent to +91 {groupMobile(mobile)} ·{" "}
              <button
                type="button"
                className={t.link}
                onClick={() => backToNumber(null)}
                disabled={busy === "finishing"}
              >
                Change number
              </button>
            </p>
          </div>

          <OtpCodeInput
            value={code}
            length={settings.otpLength}
            onChange={(next) => {
              setCode(next);
              if (error) setError(null);
            }}
            onComplete={(full) => void handleVerify(full)}
            disabled={working}
            invalid={Boolean(error) && !pendingToken}
            autoFocus
            label={`${settings.otpLength}-digit verification code`}
            slotClassName={t.slot}
            activeSlotClassName={t.slotActive}
          />

          <div className="min-h-5 text-center" aria-live="polite">
            {busy === "verifying" || busy === "finishing" ? (
              <p className={`${t.muted} inline-flex items-center gap-2`}>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                  aria-hidden
                />
                {busy === "finishing" ? finishingLabel : "Checking code…"}
              </p>
            ) : error ? (
              <p role="alert" className={t.error}>
                {error}
              </p>
            ) : notice ? (
              <p className={t.notice}>{notice}</p>
            ) : null}
          </div>

          {pendingToken && !working && error ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className={t.primary}
                onClick={() => void finish(pendingToken, mobile)}
              >
                Try again
              </button>
              <button
                type="button"
                className={t.secondary}
                onClick={() => backToNumber(null)}
              >
                Use a different number
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={t.primary}
                disabled={working || code.length !== settings.otpLength}
                onClick={() => void handleVerify(code)}
              >
                Verify
              </button>

              <p className={`${t.muted} text-center`}>
                {resendsLeft <= 0 ? (
                  <>Didn’t get it? Change the number, or try again in a few minutes.</>
                ) : secondsLeft > 0 ? (
                  <>Resend code in {formatCountdown(secondsLeft)}</>
                ) : (
                  <>
                    Didn’t get it?{" "}
                    <button
                      type="button"
                      className={t.link}
                      onClick={() => void handleResend()}
                      disabled={working}
                    >
                      Resend code
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
