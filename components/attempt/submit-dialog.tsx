"use client";

import { AttemptModal } from "@/components/attempt/attempt-modal";
import { StudyButton } from "@/components/study/study-button";
import type { QuestionStatusSummary } from "@/types/attempt-runner";

type SubmitDialogProps = {
  open: boolean;
  isSessionWise: boolean;
  isLastSession: boolean;
  sectionName: string;
  summary: QuestionStatusSummary;
  submitLabel: string;
  submitError: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const BUTTON_CLASS =
  "inline-flex h-11 w-full items-center justify-center rounded-[10px] px-5 text-sm font-semibold sm:w-auto";

export function SubmitDialog({
  open,
  isSessionWise,
  isLastSession,
  sectionName,
  summary,
  submitLabel,
  submitError,
  isSubmitting,
  onConfirm,
  onCancel,
}: SubmitDialogProps) {
  const summaryRows: ReadonlyArray<readonly [string, number]> = [
    ["Questions", summary.total],
    ["Answered", summary.answered],
    ["Not answered", summary.notAnswered],
    ["Marked", summary.marked],
    ["Not visited", summary.notVisited],
  ];
  const unanswered = summary.total - summary.answered;

  return (
    <AttemptModal
      open={open}
      onClose={() => {
        if (!isSubmitting) onCancel();
      }}
      labelledBy="submit-dialog-title"
      describedBy="submit-dialog-body"
    >
      <h2
        id="submit-dialog-title"
        className="text-center font-display text-lg font-semibold text-study-ink sm:text-xl"
      >
        {isSessionWise ? "Exam Summary" : "Submit Test?"}
      </h2>

      <div id="submit-dialog-body" className="mt-3 space-y-4 text-sm text-study-ink">
        {isSessionWise ? (
          <>
            <p className="truncate text-center font-semibold">{sectionName}</p>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {summaryRows.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-study-divider bg-study-canvas px-2.5 py-2 text-center"
                >
                  <dt className="text-[11px] leading-tight font-medium text-study-muted-soft">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-base font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-center leading-relaxed">
              Are you sure you want to submit
              {isLastSession ? " the test?" : " this section?"}
            </p>
            {!isLastSession ? (
              <p className="text-center text-xs leading-relaxed text-study-peach-ink">
                You cannot return to this section after moving ahead.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-center">Are you sure you want to submit the test?</p>
            <div className="space-y-1 text-center font-medium">
              <p className="text-study-green">Answered: {summary.answered}</p>
              <p className="text-study-peach-ink">Not Answered: {unanswered}</p>
            </div>
          </>
        )}
        {submitError ? (
          <p role="alert" className="text-center text-sm text-study-peach-ink">
            {submitError}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <StudyButton
          variant="surface"
          onClick={onCancel}
          disabled={isSubmitting}
          className={BUTTON_CLASS}
        >
          {isSessionWise ? "Back" : "Review Again"}
        </StudyButton>
        <StudyButton
          variant="solid"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={BUTTON_CLASS}
        >
          {submitLabel}
        </StudyButton>
      </div>
    </AttemptModal>
  );
}
