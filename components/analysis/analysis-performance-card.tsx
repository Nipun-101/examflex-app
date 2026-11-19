"use client";

import { useState } from "react";
import { AnalysisScoreGauge } from "@/components/analysis/analysis-score-gauge";
import { StudyButton } from "@/components/study/study-button";
import {
  clampAnalysisScore,
  formatAnalysisScore,
} from "@/lib/analysis/format-score";

type AnalysisPerformanceCardProps = {
  label: string;
  score: number | null;
  maxScore: number;
  scoreHint: string;
  editEnabled?: boolean;
  onScoreChange?: (score: number) => void;
};

export function AnalysisPerformanceCard({
  label,
  score,
  maxScore,
  scoreHint,
  editEnabled = false,
  onScoreChange,
}: AnalysisPerformanceCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(score ?? 0));
  const empty = score === null;

  function beginEdit() {
    setDraft(String(score ?? 0));
    setEditing(true);
  }

  function saveEdit() {
    const parsed = Number.parseInt(draft, 10);
    const next = Number.isFinite(parsed)
      ? clampAnalysisScore(parsed, maxScore)
      : (score ?? 0);
    onScoreChange?.(next);
    setEditing(false);
  }

  return (
    <section className="rounded-[18px] bg-study-ink px-4 py-5 text-white sm:px-5 sm:py-6 lg:px-6 lg:py-7">
      <p className="text-[0.625rem] font-semibold tracking-wide text-study-lime uppercase">
        {label}
      </p>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            {editing ? (
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="sr-only">Edit score out of {maxScore}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={maxScore}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="h-12 w-full max-w-[12rem] rounded-[10px] border border-study-on-dark/40 bg-white px-3 font-display text-2xl font-semibold text-study-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-lime"
                />
              </label>
            ) : (
              <p className="font-display text-[2rem] font-semibold leading-none tracking-tight text-white lg:text-[2.75rem]">
                {empty ? `— / ${maxScore}` : formatAnalysisScore(score, maxScore)}
              </p>
            )}

            {editEnabled && onScoreChange && !empty ? (
              <StudyButton
                variant="surface"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] px-5 text-[0.8125rem] font-medium"
                onClick={editing ? saveEdit : beginEdit}
              >
                {editing ? "Save" : "Edit"}
              </StudyButton>
            ) : null}
          </div>

          <p className="mt-4 max-w-md text-[0.6875rem] leading-[1.45] text-study-on-dark sm:text-xs">
            {scoreHint}
          </p>
        </div>

        <AnalysisScoreGauge
          score={empty ? null : score}
          maxScore={maxScore}
          className="mx-auto sm:mx-0"
        />
      </div>
    </section>
  );
}
