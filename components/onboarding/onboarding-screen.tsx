"use client";

import { Check, LogOut, ShieldCheck } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import {
  MobileOtpForm,
  type OtpVerifiedOutcome,
} from "@/components/auth/mobile-otp-form";
import { StudyButton } from "@/components/study/study-button";
import { completeOnboarding, verifyMyPhone } from "@/lib/api/onboarding";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";
import { logout } from "@/lib/auth/tokens";
import { APP_NAME, APP_STUDY_TAGLINE } from "@/lib/constants";
import {
  initialNameFor,
  normalizeName,
  validateName,
} from "@/lib/onboarding/validate";
import { displayPhoneFromApi } from "@/lib/profile/map-user";
import type { EquationExamOption } from "@/types/equation-book";
import type { ApiUserProfile } from "@/types/user";

type OnboardingScreenProps = {
  profile: ApiUserProfile;
  /** The profile changed (for example the number was just verified). */
  onProfileChange: (profile: ApiUserProfile) => void;
  /** Everything is saved; the app can open. */
  onComplete: (profile: ApiUserProfile) => void;
};

type ExamsState =
  | { status: "loading" }
  | { status: "ready"; exams: EquationExamOption[] }
  | { status: "error" };

function groupMobile(digits: string): string {
  return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

const STEP_BADGE =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold transition-colors";
const FIELD_LABEL =
  "text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase";

export function OnboardingScreen({
  profile,
  onProfileChange,
  onComplete,
}: OnboardingScreenProps) {
  const nameId = useId();
  const [name, setName] = useState(() => initialNameFor(profile.name));
  const [nameTouched, setNameTouched] = useState(false);
  const [examId, setExamId] = useState<string | null>(
    () => profile.targetExam?.id ?? null
  );
  const [examsState, setExamsState] = useState<ExamsState>({
    status: "loading",
  });
  const [examsAttempt, setExamsAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const phoneVerified = profile.phoneVerified === true;
  const nameError = validateName(name);
  const nameOk = nameError === null;
  const examOk = examId !== null;
  const canContinue = nameOk && phoneVerified && examOk && !saving;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const exams = await listShowInAppExams();
      if (cancelled) return;
      setExamsState(
        exams.length > 0 ? { status: "ready", exams } : { status: "error" }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [examsAttempt]);

  const verifiedDigits = useMemo(
    () => displayPhoneFromApi(profile.phoneNumber),
    [profile.phoneNumber]
  );

  async function handlePhoneVerified(
    accessToken: string
  ): Promise<OtpVerifiedOutcome> {
    const result = await verifyMyPhone(accessToken);
    if (result.ok) {
      onProfileChange(result.data);
      return { ok: true };
    }
    // Network/server trouble: the same code can be submitted again. Anything
    // else (expired code, number already on another account) needs a new try.
    const transient = result.status === undefined || result.status >= 500;
    return { ok: false, retryable: transient, message: result.message };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setNameTouched(true);
    if (!canContinue || examId === null) return;

    setSaving(true);
    setSubmitError(null);
    const result = await completeOnboarding({
      name: normalizeName(name),
      targetExamId: examId,
    });
    setSaving(false);
    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }
    onComplete(result.data);
  }

  const missingHint = !phoneVerified
    ? "Verify your mobile number to continue."
    : !nameOk
      ? "Add your name to continue."
      : !examOk
        ? "Pick your target exam to continue."
        : null;

  return (
    <div className="flex min-h-dvh flex-col bg-study-canvas text-study-ink">
      <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-12">
        <div className="flex min-w-0 flex-col gap-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG wordmark from /public */}
          <img
            src="/examflex-wordmark.svg"
            alt={APP_NAME}
            width={135}
            height={36}
            className="h-7 w-auto sm:h-8"
          />
          <span className="max-w-[15rem] text-[0.625rem] leading-[1.4] text-study-muted">
            {APP_STUDY_TAGLINE}
          </span>
        </div>
        <StudyButton
          variant="surface"
          onClick={() => void logout()}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-4 text-sm font-medium"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </StudyButton>
      </header>

      <main className="mx-auto w-full max-w-[560px] flex-1 px-4 pb-12 pt-2 sm:pt-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[20px] border border-study-divider bg-white p-5 shadow-soft sm:p-8"
        >
          <p className={FIELD_LABEL}>Welcome</p>
          <h1 className="mt-2 font-display text-2xl font-semibold leading-[1.3] text-study-ink sm:text-[1.75rem]">
            Let’s set up your desk
          </h1>
          <p className="mt-2 text-sm leading-[1.5] text-study-muted-soft">
            Three quick things so {APP_NAME} can personalise your practice.
            This takes about a minute.
          </p>

          <ol className="mt-7 space-y-7">
            {/* 1 · Name */}
            <li className="flex gap-4">
              <span
                className={`${STEP_BADGE} ${
                  nameOk ? "bg-study-mint text-study-green" : "bg-study-ink text-white"
                }`}
                aria-hidden
              >
                {nameOk ? <Check className="h-3.5 w-3.5" /> : "01"}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <label htmlFor={nameId} className={FIELD_LABEL}>
                  Your name
                </label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="As you’d like us to call you"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onBlur={() => {
                    // Drop anything invisible that came along with a paste, and
                    // show the learner exactly what will be saved.
                    setName((current) => normalizeName(current));
                    setNameTouched(true);
                  }}
                  aria-invalid={nameTouched && !nameOk ? true : undefined}
                  aria-describedby={
                    nameTouched && !nameOk ? `${nameId}-error` : undefined
                  }
                  className="h-12 w-full rounded-[10px] border border-study-divider bg-study-canvas px-3 text-sm text-study-ink placeholder:text-study-muted-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green"
                />
                {nameTouched && nameError ? (
                  <p
                    id={`${nameId}-error`}
                    role="alert"
                    className="text-xs text-study-peach-ink"
                  >
                    {nameError}
                  </p>
                ) : null}
              </div>
            </li>

            {/* 2 · Mobile */}
            <li className="flex gap-4">
              <span
                className={`${STEP_BADGE} ${
                  phoneVerified
                    ? "bg-study-mint text-study-green"
                    : "bg-study-ink text-white"
                }`}
                aria-hidden
              >
                {phoneVerified ? <Check className="h-3.5 w-3.5" /> : "02"}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <p className={FIELD_LABEL}>Mobile number</p>
                {phoneVerified ? (
                  <div className="flex items-center justify-between gap-3 rounded-[10px] border border-study-divider bg-study-canvas px-3 py-3">
                    <span className="text-sm font-medium text-study-ink">
                      +91 {groupMobile(verifiedDigits)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-study-mint px-2.5 py-1 text-xs font-semibold text-study-green">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                      Verified
                    </span>
                  </div>
                ) : (
                  <div className="rounded-[14px] border border-dashed border-study-divider bg-study-canvas/60 p-4">
                    <p className="mb-3 text-xs leading-[1.5] text-study-muted-soft">
                      We’ll text you a code to confirm the number is yours.
                    </p>
                    <MobileOtpForm
                      theme="study"
                      initialMobile={verifiedDigits}
                      sendLabel="Send code"
                      finishingLabel="Verifying…"
                      onVerified={handlePhoneVerified}
                    />
                  </div>
                )}
              </div>
            </li>

            {/* 3 · Target exam */}
            <li className="flex gap-4">
              <span
                className={`${STEP_BADGE} ${
                  examOk ? "bg-study-mint text-study-green" : "bg-study-ink text-white"
                }`}
                aria-hidden
              >
                {examOk ? <Check className="h-3.5 w-3.5" /> : "03"}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <p id="onboarding-exam-label" className={FIELD_LABEL}>
                  Target exam
                </p>
                {examsState.status === "loading" ? (
                  <div
                    className="flex flex-wrap gap-2"
                    role="status"
                    aria-label="Loading exams"
                  >
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className="h-11 w-28 animate-pulse rounded-[10px] bg-study-divider/50"
                      />
                    ))}
                  </div>
                ) : examsState.status === "error" ? (
                  <div role="alert" className="space-y-2">
                    <p className="text-sm text-study-peach-ink">
                      We couldn’t load the exam list.
                    </p>
                    <StudyButton
                      variant="outline"
                      onClick={() => {
                        setExamsState({ status: "loading" });
                        setExamsAttempt((attempt) => attempt + 1);
                      }}
                      className="inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-medium"
                    >
                      Try again
                    </StudyButton>
                  </div>
                ) : (
                  <div
                    role="radiogroup"
                    aria-labelledby="onboarding-exam-label"
                    className="flex flex-wrap gap-2"
                  >
                    {examsState.exams.map((exam) => {
                      const selected = exam.id === examId;
                      return (
                        <button
                          key={exam.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setExamId(exam.id)}
                          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-[10px] border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green ${
                            selected
                              ? "border-study-ink bg-study-ink text-white"
                              : "border-study-divider bg-white text-study-ink hover:bg-study-mint"
                          }`}
                        >
                          {exam.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </li>
          </ol>

          <div className="mt-8 space-y-3">
            {submitError ? (
              <p role="alert" className="text-sm text-study-peach-ink">
                {submitError}
              </p>
            ) : null}
            <StudyButton
              type="submit"
              variant="ink"
              disabled={!canContinue}
              className="inline-flex h-12 w-full items-center justify-center rounded-[10px] px-5 text-sm font-medium"
            >
              {saving ? "Saving…" : "Continue"}
            </StudyButton>
            {missingHint && !saving ? (
              <p className="text-center text-xs text-study-muted-soft">
                {missingHint}
              </p>
            ) : null}
          </div>
        </form>
      </main>
    </div>
  );
}
