"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { ViewPlansDialog } from "@/components/mocks/view-plans-dialog";
import { StudyButton } from "@/components/study/study-button";
import { useExamPage } from "@/hooks/use-exam-page";
import {
  formatCount,
  formatDurationMinutes,
  formatMarksPerQuestion,
} from "@/lib/mocks/format";

const EMPTY_DESCRIPTION =
  "Pick Chapter Wise, Full Mocks, or Sprint Tests to start practicing.";

export function ExamOverview() {
  const { examId, exam, loading } = useExamPage();
  const [plansOpen, setPlansOpen] = useState(false);

  if (loading || !exam) return null;

  const subjects = exam.subjects ?? [];

  return (
    <div className="space-y-6">
      <section aria-labelledby="exam-overview-heading">
        <h2
          id="exam-overview-heading"
          className="font-display text-xl font-semibold text-study-ink"
        >
          Overview
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed whitespace-pre-wrap text-study-muted-soft">
          {exam.description?.trim() || EMPTY_DESCRIPTION}
        </p>
        <StudyButton
          variant="outline"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold"
          onClick={() => setPlansOpen(true)}
        >
          <Lock className="h-4 w-4" aria-hidden />
          View plans
        </StudyButton>
      </section>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Duration" value={formatDurationMinutes(exam.duration)} />
        <Stat label="Questions" value={formatCount(exam.totalQuestions)} />
        <Stat label="Marks" value={formatCount(exam.totalMarks)} />
        <Stat
          label="Mode"
          value={exam.isSessionWise ? "Session-wise" : "Single paper"}
        />
      </dl>

      <section aria-labelledby="exam-structure-heading">
        <h3
          id="exam-structure-heading"
          className="font-display text-lg font-semibold text-study-ink"
        >
          Structure
        </h3>
        {subjects.length === 0 ? (
          <p className="mt-3 rounded-[12px] border border-study-divider bg-white px-4 py-6 text-center text-sm text-study-muted-soft">
            Structure for this exam will be available soon.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <li
                key={subject.subject}
                className="rounded-[12px] border border-study-divider bg-white px-3 py-3 text-sm"
              >
                <p className="font-medium text-study-ink">
                  {subject.name?.trim() || "Subject"}
                </p>
                <p className="mt-1 text-study-muted-soft">
                  {subject.numberOfQuestions} questions ·{" "}
                  {formatMarksPerQuestion(subject.marksPerQuestion)}
                  {subject.hasNegativeMarking
                    ? ` · −${subject.negativeMarksPerQuestion} negative`
                    : " · no negative marking"}
                  {exam.isSessionWise && subject.sessionTime
                    ? ` · ${formatDurationMinutes(subject.sessionTime)}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {exam.hasMultiLingualSupport ? (
        <p className="text-sm text-study-muted-soft">
          This exam supports English and Malayalam during attempts.
        </p>
      ) : null}

      <ViewPlansDialog
        open={plansOpen}
        onClose={() => setPlansOpen(false)}
        examId={examId}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-study-divider bg-white px-3 py-3">
      <dt className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-semibold text-study-ink">
        {value}
      </dd>
    </div>
  );
}
