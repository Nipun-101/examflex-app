"use client";

import type { ResultOutcome } from "@/lib/mocks/result-outcome";

export type ResultsQuestionMapItem = {
  paperNumber: number;
  questionId: string;
  outcome: ResultOutcome;
};

type ResultsQuestionMapProps = {
  items: readonly ResultsQuestionMapItem[];
  onJump: (paperNumber: number) => void;
};

const CELL: Record<ResultOutcome, string> = {
  correct:
    "cursor-pointer bg-study-green text-white hover:brightness-110 hover:shadow-md",
  wrong:
    "cursor-pointer bg-[#f3d4c6] text-study-peach-ink hover:brightness-95 hover:shadow-md",
  skipped:
    "cursor-pointer border border-dashed border-study-muted-soft/80 bg-white text-study-muted-soft hover:border-study-muted hover:bg-study-canvas hover:shadow-md",
};

const DOT: Record<ResultOutcome, string> = {
  correct: "bg-study-green",
  wrong: "bg-[#c56a45]",
  skipped: "border border-dashed border-study-muted-soft bg-white",
};

export function ResultsQuestionMap({ items, onJump }: ResultsQuestionMapProps) {
  return (
    <section
      aria-labelledby="question-map-heading"
      className="rounded-[20px] border border-study-divider bg-white p-4 shadow-soft sm:p-5"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2
          id="question-map-heading"
          className="font-display text-base font-bold text-study-ink"
        >
          Question map
        </h2>
        <p className="text-xs text-study-muted-soft">Tap to jump</p>
      </div>

      <ol className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-5">
        {items.map((item) => (
          <li key={item.questionId}>
            <button
              type="button"
              onClick={() => onJump(item.paperNumber)}
              aria-label={`Question ${item.paperNumber}, ${item.outcome}`}
              className={`grid size-10 place-items-center rounded-full text-sm font-bold tabular-nums transition-[transform,box-shadow,filter,background-color,border-color] duration-150 hover:scale-[1.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green ${CELL[item.outcome]}`}
            >
              {item.paperNumber}
            </button>
          </li>
        ))}
      </ol>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-study-muted-soft">
        {(
          [
            ["correct", "Correct"],
            ["wrong", "Wrong"],
            ["skipped", "Skipped"],
          ] as const
        ).map(([key, label]) => (
          <li key={key} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className={`size-2.5 rounded-[3px] ${DOT[key]}`}
            />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function answerKeyQuestionDomId(paperNumber: number): string {
  return `answer-key-q-${paperNumber}`;
}
