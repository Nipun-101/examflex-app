"use client";

import { StudyButton } from "@/components/study/study-button";
import type { EquationExamOption } from "@/types/equation-book";

type ExamChoiceModalProps = {
  open: boolean;
  exams: readonly EquationExamOption[];
  title?: string;
  body?: string;
  onSelect: (exam: EquationExamOption) => void;
  onDismiss?: () => void;
};

export function ExamChoiceModal({
  open,
  exams,
  title = "Which exam?",
  body = "Pick the exam you want to open. Only exams listed for ExamFlex are shown.",
  onSelect,
  onDismiss,
}: ExamChoiceModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-study-ink/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="equation-exam-choice-title"
    >
      <div className="w-full max-w-sm rounded-[20px] border border-study-divider bg-white p-5 shadow-soft sm:p-6">
        <h2
          id="equation-exam-choice-title"
          className="font-display text-xl font-semibold text-study-ink"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-[1.45] text-study-muted-soft">
          {body}
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {exams.map((exam) => (
            <li key={exam.id}>
              <StudyButton
                variant="ink"
                className="inline-flex h-12 w-full items-center justify-center rounded-[10px] text-sm font-medium"
                onClick={() => onSelect(exam)}
              >
                {exam.name}
              </StudyButton>
            </li>
          ))}
        </ul>
        {onDismiss ? (
          <StudyButton
            variant="soft"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-medium"
            onClick={onDismiss}
          >
            Cancel
          </StudyButton>
        ) : null}
      </div>
    </div>
  );
}
