"use client";

import { useId, useState } from "react";
import { ArrowRight, User, X } from "lucide-react";
import { AttemptModal } from "@/components/attempt/attempt-modal";
import { StudyButton } from "@/components/study/study-button";
import { createCounselingRequest } from "@/lib/api/counseling";
import { counselingModalSubtitle } from "@/lib/counseling/copy";
import {
  hasCounselingBookingErrors,
  toCreateCounselingPayload,
  validateCounselingBooking,
} from "@/lib/counseling/validate-booking";
import { useStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import type {
  CounselingBookingFieldErrors,
  CounselingBookingForm,
  CounselingPrefill,
  CounselingWhoWillJoin,
} from "@/types/counseling";

export type AnalysisCounselingBookingModalProps = {
  open: boolean;
  onClose: () => void;
  examName: string;
  prefill: CounselingPrefill;
  onBooked: () => void;
};

function emptyForm(prefill: CounselingPrefill): CounselingBookingForm {
  return {
    studentName: prefill.studentName,
    whoWillJoin: "student",
    courseInterestedIn: prefill.courseInterestedIn,
    expectedMark: prefill.expectedMark,
    twelfthMarks: "",
    state: prefill.state,
    category: "",
    preferredDayTime: "",
    talkAbout: "",
    contact: {
      emailEnabled: true,
      email: prefill.email,
      phoneEnabled: true,
      phone: prefill.phone,
    },
  };
}

function FieldLabel({
  htmlFor,
  children,
  optional = true,
}: {
  htmlFor: string;
  children: string;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-study-ink"
    >
      {children}
      {optional ? (
        <span className="ml-1 font-normal text-study-muted-soft">
          (optional)
        </span>
      ) : null}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-[12px] border border-study-divider bg-white px-3.5 text-sm text-study-ink outline-none placeholder:text-study-muted-soft focus:border-study-green";

export function AnalysisCounselingBookingModal({
  open,
  onClose,
  examName,
  prefill,
  onBooked,
}: AnalysisCounselingBookingModalProps) {
  const titleId = useId();
  const descId = useId();
  const studyLoading = useStudyLoadingOverlay();
  // Fresh state on each open: parent mounts this modal only while `open` is true.
  const [form, setForm] = useState<CounselingBookingForm>(() =>
    emptyForm(prefill)
  );
  const [errors, setErrors] = useState<CounselingBookingFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const expectedMarkHint =
    prefill.latestMockScore != null && prefill.latestMockMaxScore != null
      ? `Your latest mock score, ${prefill.latestMockScore}, fills in here once you have one.`
      : "Your latest mock score fills in here once you have one.";

  function patchForm(patch: Partial<CounselingBookingForm>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function patchContact(
    patch: Partial<CounselingBookingForm["contact"]>
  ) {
    setForm((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...patch },
    }));
  }

  function setWhoWillJoin(value: CounselingWhoWillJoin) {
    patchForm({ whoWillJoin: value });
  }

  async function handleSubmit() {
    const nextErrors = validateCounselingBooking(form);
    setErrors(nextErrors);
    setSubmitError(null);
    if (hasCounselingBookingErrors(nextErrors)) return;

    const payload = toCreateCounselingPayload(form);
    const result = await studyLoading.run(
      () => createCounselingRequest(payload),
      { label: "Requesting your slot..." }
    );
    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }
    onBooked();
    onClose();
  }

  return (
    <AttemptModal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descId}
      panelClassName="!max-w-3xl p-0 sm:!p-0"
    >
      <div className="flex flex-col">
        <header className="flex items-start gap-3 border-b border-study-divider px-5 py-4 sm:px-6">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6d5bd0] text-white"
            aria-hidden
          >
            <User className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-display text-lg font-semibold text-study-ink sm:text-xl"
            >
              Book a 1:1 session
            </h2>
            <p id={descId} className="mt-0.5 text-sm text-study-muted-soft">
              {counselingModalSubtitle(examName)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-study-divider text-study-muted-soft hover:bg-study-mint"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
          <p className="rounded-[12px] bg-study-mint px-3.5 py-3 text-sm text-study-ink">
            Share what you can. Everything except how to reach you is optional,
            and it helps your mentor prepare.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="counseling-student-name">
                Student&apos;s name
              </FieldLabel>
              <input
                id="counseling-student-name"
                className={inputClass}
                value={form.studentName}
                onChange={(event) =>
                  patchForm({ studentName: event.target.value })
                }
                placeholder="Riya Sharma"
                autoComplete="name"
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-semibold text-study-ink">
                Who will join?
              </p>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Who will join"
              >
                {(
                  [
                    { value: "student", label: "Student" },
                    {
                      value: "student_and_parent",
                      label: "Student + parent",
                    },
                  ] as const
                ).map((option) => {
                  const selected = form.whoWillJoin === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setWhoWillJoin(option.value)}
                      className={`min-h-11 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors ${
                        selected
                          ? "bg-study-green text-white"
                          : "border border-study-divider bg-white text-study-ink hover:bg-study-mint"
                      }`}
                      aria-pressed={selected}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="counseling-course">
                Course interested in
              </FieldLabel>
              <input
                id="counseling-course"
                className={inputClass}
                value={form.courseInterestedIn}
                onChange={(event) =>
                  patchForm({ courseInterestedIn: event.target.value })
                }
                placeholder="NEET UG"
              />
            </div>

            <div>
              <FieldLabel htmlFor="counseling-expected-mark">
                Expected mark
              </FieldLabel>
              <input
                id="counseling-expected-mark"
                className={inputClass}
                value={form.expectedMark}
                onChange={(event) =>
                  patchForm({ expectedMark: event.target.value })
                }
                placeholder="e.g. 540 out of 720"
              />
              <p className="mt-1.5 text-xs text-study-muted-soft">
                {expectedMarkHint}
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="counseling-twelfth">
                12th marks / percentage
              </FieldLabel>
              <input
                id="counseling-twelfth"
                className={inputClass}
                value={form.twelfthMarks}
                onChange={(event) =>
                  patchForm({ twelfthMarks: event.target.value })
                }
                placeholder="e.g. 92%"
              />
            </div>

            <div>
              <FieldLabel htmlFor="counseling-state">State</FieldLabel>
              <input
                id="counseling-state"
                className={inputClass}
                value={form.state}
                onChange={(event) => patchForm({ state: event.target.value })}
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <FieldLabel htmlFor="counseling-category">Category</FieldLabel>
              <input
                id="counseling-category"
                className={inputClass}
                value={form.category}
                onChange={(event) =>
                  patchForm({ category: event.target.value })
                }
                placeholder="e.g. General"
              />
            </div>

            <div>
              <FieldLabel htmlFor="counseling-preferred">
                Preferred day and time
              </FieldLabel>
              <input
                id="counseling-preferred"
                className={inputClass}
                value={form.preferredDayTime}
                onChange={(event) =>
                  patchForm({ preferredDayTime: event.target.value })
                }
                placeholder="e.g. Sunday evening"
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="counseling-talk">
              What would you like to talk about?
            </FieldLabel>
            <p className="mb-1.5 text-xs text-study-muted-soft">
              Doubts, worries, colleges on your mind
            </p>
            <textarea
              id="counseling-talk"
              className="min-h-28 w-full resize-y rounded-[12px] border border-study-divider bg-white px-3.5 py-3 text-sm text-study-ink outline-none placeholder:text-study-muted-soft focus:border-study-green"
              value={form.talkAbout}
              onChange={(event) =>
                patchForm({ talkAbout: event.target.value })
              }
              placeholder="Type here..."
            />
          </div>

          <section className="rounded-[16px] border border-study-peach/80 bg-[#fbf6f1] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-study-ink">
                How should we reach you?
              </h3>
              <span className="rounded-full bg-study-peach px-2.5 py-1 text-[0.625rem] font-bold tracking-wide text-study-peach-ink uppercase">
                Required · pick one or both
              </span>
            </div>
            {errors.contact ? (
              <p className="mt-2 text-sm text-study-peach-ink" role="alert">
                {errors.contact}
              </p>
            ) : null}

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label
                className={`flex cursor-pointer flex-col gap-2 rounded-[14px] border px-3.5 py-3 ${
                  form.contact.emailEnabled
                    ? "border-study-green/40 bg-study-mint"
                    : "border-study-divider bg-white"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-study-green"
                    checked={form.contact.emailEnabled}
                    onChange={(event) =>
                      patchContact({ emailEnabled: event.target.checked })
                    }
                  />
                  <div>
                    <div className="text-sm font-semibold text-study-ink">
                      Email
                    </div>
                    <div className="text-xs text-study-muted-soft">
                      We&apos;ll send the slot details
                    </div>
                  </div>
                </div>
                <input
                  type="email"
                  className={inputClass}
                  value={form.contact.email}
                  onChange={(event) =>
                    patchContact({ email: event.target.value })
                  }
                  placeholder="riya@example.com"
                  disabled={!form.contact.emailEnabled}
                  autoComplete="email"
                />
                {errors.email ? (
                  <p className="text-sm text-study-peach-ink" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </label>

              <label
                className={`flex cursor-pointer flex-col gap-2 rounded-[14px] border px-3.5 py-3 ${
                  form.contact.phoneEnabled
                    ? "border-study-green/40 bg-study-mint"
                    : "border-study-divider bg-white"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-study-green"
                    checked={form.contact.phoneEnabled}
                    onChange={(event) =>
                      patchContact({ phoneEnabled: event.target.checked })
                    }
                  />
                  <div>
                    <div className="text-sm font-semibold text-study-ink">
                      Phone
                    </div>
                    <div className="text-xs text-study-muted-soft">
                      Call or WhatsApp
                    </div>
                  </div>
                </div>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.contact.phone}
                  onChange={(event) =>
                    patchContact({ phone: event.target.value })
                  }
                  placeholder="10-digit mobile number"
                  disabled={!form.contact.phoneEnabled}
                  autoComplete="tel"
                />
                {errors.phone ? (
                  <p className="text-sm text-study-peach-ink" role="alert">
                    {errors.phone}
                  </p>
                ) : null}
              </label>
            </div>
          </section>

          {submitError ? (
            <p className="text-sm text-study-peach-ink" role="alert">
              {submitError}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-col gap-3 border-t border-study-divider px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="order-2 text-xs text-study-muted-soft sm:order-1">
            We use these details only to arrange your session.
          </p>
          <div className="order-1 flex flex-col gap-2 sm:order-2 sm:flex-row">
            <StudyButton
              type="button"
              variant="outline"
              className="min-h-11 rounded-full px-5"
              onClick={onClose}
            >
              Not now
            </StudyButton>
            <StudyButton
              type="button"
              variant="solid"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-5"
              onClick={() => {
                void handleSubmit();
              }}
            >
              Request my slot
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </StudyButton>
          </div>
        </footer>
      </div>
    </AttemptModal>
  );
}
