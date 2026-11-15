"use client";

import { useState } from "react";
import { StudyButton } from "@/components/study/study-button";
import {
  clampAnalysisScore,
  formatAnalysisScore,
} from "@/lib/analysis/format-score";
import type { AnalysisPerformance } from "@/types/analysis";

type AnalysisPerformanceCardProps = {
  performance: AnalysisPerformance;
  score: number;
  onScoreChange: (score: number) => void;
};

export function AnalysisPerformanceCard({
  performance,
  score,
  onScoreChange,
}: AnalysisPerformanceCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(score));

  function beginEdit() {
    setDraft(String(score));
    setEditing(true);
  }

  function saveEdit() {
    const parsed = Number.parseInt(draft, 10);
    const next = Number.isFinite(parsed)
      ? clampAnalysisScore(parsed, performance.maxScore)
      : score;
    onScoreChange(next);
    setEditing(false);
  }

  return (
    <section className="rounded-[18px] bg-study-ink px-4 py-4 text-white sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <p className="text-[0.625rem] font-semibold tracking-wide text-study-lime uppercase">
        {performance.label}
      </p>

      <div className="mt-3 flex items-start justify-between gap-3">
        {editing ? (
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="sr-only">Edit score out of {performance.maxScore}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={performance.maxScore}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="h-12 w-full max-w-[12rem] rounded-[10px] border border-study-on-dark/40 bg-white px-3 font-display text-2xl font-semibold text-study-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-lime"
            />
          </label>
        ) : (
          <p className="font-display text-[2rem] font-semibold leading-none text-white lg:text-[2.5rem]">
            {formatAnalysisScore(score, performance.maxScore)}
          </p>
        )}

        <StudyButton
          variant="surface"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] px-5 text-[0.8125rem] font-medium"
          onClick={editing ? saveEdit : beginEdit}
        >
          {editing ? "Save" : performance.editLabel}
        </StudyButton>
      </div>

      <p className="mt-4 text-[0.6875rem] text-study-on-dark">
        {performance.scoreHint}
      </p>
    </section>
  );
}
