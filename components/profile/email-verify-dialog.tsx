"use client";

import { useId } from "react";
import { Mail, X } from "lucide-react";
import { AttemptModal } from "@/components/attempt/attempt-modal";
import { OtpCaptchaBox } from "@/components/auth/otp-captcha-box";
import { OtpCodeInput } from "@/components/auth/otp-code-input";
import {
  formatCountdown,
  useOtpVerification,
  type OtpVerifiedOutcome,
} from "@/hooks/use-otp-verification";
import { verifyMyEmail } from "@/lib/api/onboarding";
import { OTP_THEMES } from "@/lib/auth/otp-theme";
import type { ApiUserProfile } from "@/types/user";

type EmailVerifyDialogProps = {
  /** Already trimmed, lowercased and format-checked. */
  email: string;
  onVerified: (profile: ApiUserProfile) => void;
  onClose: () => void;
};

const CAPTCHA_ELEMENT_ID = "msg91-email-captcha";
const t = OTP_THEMES.study;

/**
 * Proves the learner owns `email` with an emailed code (MSG91 widget, email
 * channel), then attaches it through the API. Mount it only while open: the
 * widget starts on mount.
 */
export function EmailVerifyDialog({
  email,
  onVerified,
  onClose,
}: EmailVerifyDialogProps) {
  const titleId = useId();
  const descId = useId();

  async function handleVerified(
    accessToken: string
  ): Promise<OtpVerifiedOutcome> {
    const result = await verifyMyEmail(accessToken);
    if (result.ok) {
      onVerified(result.data);
      return { ok: true };
    }
    // Network/server trouble: the same code can be submitted again. Anything
    // else (expired code, email on another account) needs a fresh start.
    const transient = result.status === undefined || result.status >= 500;
    return { ok: false, retryable: transient, message: result.message };
  }

  const otp = useOtpVerification({
    captchaElementId: CAPTCHA_ELEMENT_ID,
    onVerified: handleVerified,
  });
  const {
    widget,
    step,
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

  const finishing = busy === "finishing";
  const showStart = widget !== "failed" && step === "start";
  const showCode = widget !== "failed" && step === "code";

  const spinner = (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 ${t.spinner}`}
      aria-hidden
    />
  );

  return (
    <AttemptModal
      open
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descId}
      dismissible={!finishing}
      panelClassName="!max-w-md"
    >
      <div className="flex flex-col gap-5">
        <header className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-study-mint text-study-green"
            aria-hidden
          >
            <Mail className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-display text-lg font-semibold text-study-ink sm:text-xl"
            >
              Verify your email
            </h2>
            <p id={descId} className="mt-0.5 text-sm text-study-muted-soft">
              {showCode
                ? "Enter the code we emailed you."
                : "We’ll email you a code to confirm it’s yours."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={finishing}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-study-divider text-study-muted-soft hover:bg-study-mint disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {widget === "failed" ? (
          <div className="space-y-3" role="alert">
            <p className={t.error}>
              We couldn’t load email verification. Check your connection and
              try again.
            </p>
            <button type="button" className={t.secondary} onClick={otp.retryLoad}>
              Try again
            </button>
          </div>
        ) : null}

        {showStart ? (
          <div className="rounded-[12px] bg-study-canvas px-3.5 py-3">
            <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
              Sending to
            </p>
            <p className="mt-1 text-sm font-semibold break-all text-study-ink">
              {email}
            </p>
          </div>
        ) : null}

        <OtpCaptchaBox
          boxRef={otp.captchaBoxRef}
          innerRef={otp.captchaInnerRef}
          fit={otp.captchaFit}
          elementId={CAPTCHA_ELEMENT_ID}
          visible={showStart}
        />

        {showStart ? (
          <div className="flex flex-col gap-3">
            {error ? (
              <p role="alert" className={t.error}>
                {error}
              </p>
            ) : null}
            <button
              type="button"
              className={t.primary}
              onClick={() => void otp.send(email, email)}
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
                "Send code"
              )}
            </button>
            <button type="button" className={t.secondary} onClick={onClose}>
              Use a different email
            </button>
          </div>
        ) : null}

        {showCode ? (
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-study-ink">
                Enter the {settings.otpLength}-digit code
              </p>
              <p className={`${t.muted} break-all`}>
                Sent to {email} ·{" "}
                <button
                  type="button"
                  className={t.link}
                  onClick={onClose}
                  disabled={finishing}
                >
                  Change email
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
              label={`${settings.otpLength}-digit email verification code`}
              slotClassName={t.slot}
              activeSlotClassName={t.slotActive}
            />

            <div className="min-h-5 text-center" aria-live="polite">
              {busy === "verifying" || finishing ? (
                <p className={`${t.muted} inline-flex items-center gap-2`}>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                    aria-hidden
                  />
                  {finishing ? "Saving your email…" : "Checking code…"}
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
              <button
                type="button"
                className={t.primary}
                onClick={() => void otp.retryFinish()}
              >
                Try again
              </button>
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
                    <>Didn’t get it? Try again in a few minutes.</>
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
                <p className="text-center text-xs text-study-muted-soft">
                  Can’t find it? Check your spam or promotions folder.
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </AttemptModal>
  );
}
