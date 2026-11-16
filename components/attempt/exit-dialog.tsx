"use client";

import { AttemptModal } from "@/components/attempt/attempt-modal";
import { StudyButton } from "@/components/study/study-button";

type ExitDialogProps = {
  open: boolean;
  isExiting: boolean;
  exitError: string | null;
  onStay: () => void;
  onConfirm: () => void;
};

const BUTTON_CLASS =
  "inline-flex h-11 w-full items-center justify-center rounded-[10px] px-5 text-sm font-semibold sm:w-auto";

/** Shown when the back button is trapped. Leaving always pauses first. */
export function ExitDialog({
  open,
  isExiting,
  exitError,
  onStay,
  onConfirm,
}: ExitDialogProps) {
  return (
    <AttemptModal
      open={open}
      onClose={() => {
        if (!isExiting) onStay();
      }}
      labelledBy="exit-dialog-title"
      describedBy="exit-dialog-body"
    >
      <h2
        id="exit-dialog-title"
        className="font-display text-lg font-semibold text-study-ink"
      >
        Leave the exam?
      </h2>
      <div id="exit-dialog-body" className="mt-2 space-y-2 text-sm text-study-ink">
        <p>
          Your progress will be saved and you can resume this test later from
          the mocks list.
        </p>
        {exitError ? (
          <p role="alert" className="text-study-peach-ink">
            {exitError}
          </p>
        ) : null}
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <StudyButton
          variant="surface"
          onClick={onStay}
          disabled={isExiting}
          className={BUTTON_CLASS}
        >
          Stay in Exam
        </StudyButton>
        <StudyButton
          variant="ink"
          onClick={onConfirm}
          disabled={isExiting}
          className={BUTTON_CLASS}
        >
          {isExiting ? "Saving..." : "Pause & Leave"}
        </StudyButton>
      </div>
    </AttemptModal>
  );
}
