"use client";

import { StudyButton } from "@/components/study/study-button";

type ProfileTargetExamCardProps = {
  examName: string;
  hasExam: boolean;
  saving?: boolean;
  onEdit: () => void;
};

export function ProfileTargetExamCard({
  examName,
  hasExam,
  saving = false,
  onEdit,
}: ProfileTargetExamCardProps) {
  return (
    <section className="rounded-[18px] border border-study-divider bg-white p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
            Target exam
          </p>
          <h2 className="mt-2 font-display text-lg font-semibold text-study-ink lg:text-xl">
            {hasExam ? examName : "Not set yet"}
          </h2>
          <p className="mt-1 text-sm leading-[1.45] text-study-muted-soft">
            {hasExam
              ? "Used for Equation Book, mocks, and your prep track."
              : "Pick the exam you’re preparing for so ExamFlex can personalise your desk."}
          </p>
        </div>

        <StudyButton
          variant="outline"
          disabled={saving}
          onClick={onEdit}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-[10px] px-4 text-sm font-medium"
        >
          {hasExam ? "Change exam" : "Choose exam"}
        </StudyButton>
      </div>
    </section>
  );
}
