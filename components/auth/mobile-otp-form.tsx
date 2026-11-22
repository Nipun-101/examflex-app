"use client";

import { useState } from "react";
import { OtpCaptchaBox } from "@/components/auth/otp-captcha-box";
import { OtpCodeInput } from "@/components/auth/otp-code-input";
import {
  formatCountdown,
  useOtpVerification,
  type OtpVerifiedOutcome,
} from "@/hooks/use-otp-verification";
import { OTP_THEMES } from "@/lib/auth/otp-theme";
import { toWidgetIdentifier } from "@/lib/auth/otp-widget";

export type { OtpVerifiedOutcome } from "@/hooks/use-otp-verification";

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
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

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

export function MobileOtpForm({
  onVerified,
  theme,
  initialMobile = "",
  sendLabel = "Send code",
  finishingLabel = "Finishing up…",
}: MobileOtpFormProps) {
  const t = OTP_THEMES[theme];
  const [mobileInput, setMobileInput] = useState(initialMobile);
  const otp = useOtpVerification({
    captchaElementId: CAPTCHA_ELEMENT_ID,
    onVerified,
  });
  const {
    widget,
    step,
    target: mobile,
    code,
    busy,
    working,
    error,
    notice,
    settings,
    pendingToken,
    secondsLeft,
    resendsLeft,
  } = otp;

  async function handleSend() {
    if (busy || widget !== "ready") return;

    const digits = normalizeMobile(mobileInput);
    if (!INDIAN_MOBILE.test(digits)) {
      otp.setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (await otp.send(toWidgetIdentifier(digits), digits)) {
      setMobileInput(digits);
    }
  }

  const backToNumber = otp.backToStart;

  const spinner = (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 ${t.spinner}`}
      aria-hidden
    />
  );

  const showPhone = widget !== "failed" && step === "start";
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
            onClick={otp.retryLoad}
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
              placeholder="10-digit mobile number"
              value={mobileInput}
              disabled={working}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "otp-error" : undefined}
              onChange={(event) => {
                setMobileInput(event.target.value);
                if (error) otp.setError(null);
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
      */}
      <OtpCaptchaBox
        boxRef={otp.captchaBoxRef}
        innerRef={otp.captchaInnerRef}
        fit={otp.captchaFit}
        elementId={CAPTCHA_ELEMENT_ID}
        visible={showPhone}
      />

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
            onChange={otp.setCode}
            onComplete={(full) => void otp.verify(full)}
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
                onClick={() => void otp.retryFinish()}
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
                onClick={() => void otp.verify(code)}
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
                      onClick={() => void otp.resend()}
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
