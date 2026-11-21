"use client";

import type { ReactNode } from "react";
import type { ResultOutcome } from "@/lib/mocks/result-outcome";

export type ResultsQuestionMapItem = {
  paperNumber: number;
  questionId: string;
  outcome: ResultOutcome;
};

/** One subject/section block of the map. `name` is absent for single-section papers. */
export type ResultsMapGroup = {
  id: string;
  name?: string;
  /** e.g. "1–45" */
  rangeLabel?: string;
  /** e.g. "10 correct · 28 wrong · 7 skipped" */
  summary?: string;
  items: readonly ResultsQuestionMapItem[];
};

export type ResultsStatusFilter = "all" | ResultOutcome;

export type ResultsMapSection = { id: number; name: string };

export type ResultsMapStatusCounts = {
  all: number;
  wrong: number;
  skipped: number;
  correct: number;
};

const CELL: Record<ResultOutcome, string> = {
  correct:
    "border-study-green bg-study-green text-white hover:brightness-110",
  wrong:
    "border-[#f4d6cb] bg-[#f4d6cb] text-[#8a3f2a] hover:brightness-95",
  skipped:
    "border-dashed border-[#afaa9a] bg-white text-study-muted-soft hover:bg-study-canvas",
};

const HOVER_LIFT = "hover:shadow-md";

const CURRENT_RING = "shadow-[0_0_0_2px_#fff,0_0_0_4.5px_#173b2f]";

const STATUS_FILTERS: { id: ResultsStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wrong", label: "Wrong" },
  { id: "skipped", label: "Skipped" },
  { id: "correct", label: "Correct" },
];

const CHIP_ROW =
  "flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function chipClass(active: boolean): string {
  return `inline-flex min-h-[34px] shrink-0 cursor-pointer items-center rounded-full border px-3.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green ${
    active
      ? "border-study-ink bg-study-ink text-white"
      : "border-[#d9d5c8] bg-white text-study-ink hover:border-study-green/55 hover:bg-study-mint/70"
  }`;
}

type QuestionMapFiltersProps = {
  statusFilter: ResultsStatusFilter;
  onStatusChange: (filter: ResultsStatusFilter) => void;
  statusCounts: ResultsMapStatusCounts;
  /** Subject chips. Omit (or pass fewer than two) to hide the second row. */
  sections?: readonly ResultsMapSection[];
  /** `null` means no subject is selected (everything shows). */
  sectionFilter: number | null;
  /** Tapping the selected subject again passes `null`. */
  onSectionChange: (sectionId: number | null) => void;
};

/**
 * Two independent chip rows. Top: All / Wrong / Skipped / Correct (exactly one
 * is always on). Second: the subjects, with no "All" chip: tap one to select
 * it, tap it again to clear.
 */
export function QuestionMapFilters({
  statusFilter,
  onStatusChange,
  statusCounts,
  sections,
  sectionFilter,
  onSectionChange,
}: QuestionMapFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        role="group"
        aria-label="Filter answer key by result"
        className={CHIP_ROW}
      >
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => onStatusChange(filter.id)}
              className={chipClass(active)}
            >
              {filter.label} {statusCounts[filter.id]}
            </button>
          );
        })}
      </div>

      {sections && sections.length > 1 ? (
        <div
          role="group"
          aria-label="Filter answer key by subject"
          className={CHIP_ROW}
        >
          {sections.map((section) => {
            const active = sectionFilter === section.id;
            return (
              <button
                key={section.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSectionChange(active ? null : section.id)}
                className={chipClass(active)}
              >
                {section.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type QuestionMapGridProps = {
  groups: readonly ResultsMapGroup[];
  currentPaperNumber: number | null;
  onJump: (paperNumber: number) => void;
  /** Tighter gutters inside the phone sheet. */
  compact?: boolean;
};

/** Circles grouped by subject. Pure presentation: filtering happens upstream. */
export function QuestionMapGrid({
  groups,
  currentPaperNumber,
  onJump,
  compact = false,
}: QuestionMapGridProps) {
  if (groups.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-study-muted-soft">
        No questions match these filters.
      </p>
    );
  }

  return (
    <div>
      {groups.map((group) => (
        <section key={group.id} className="mb-4 last:mb-0">
          {group.name ? (
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <h3 className="text-[13px] font-bold text-study-ink">
                {group.name}
                {group.rangeLabel ? (
                  <>
                    {" "}
                    <span className="font-medium text-study-muted-soft">
                      · {group.rangeLabel}
                    </span>
                  </>
                ) : null}
              </h3>
              {group.summary ? (
                <span className="text-[11px] font-medium text-study-muted-soft">
                  {group.summary}
                </span>
              ) : null}
            </div>
          ) : null}
          <ol
            className={`flex flex-wrap ${compact ? "gap-2.5" : "gap-2"}`}
          >
            {group.items.map((item) => {
              const current = item.paperNumber === currentPaperNumber;
              return (
                <li key={item.questionId} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onJump(item.paperNumber)}
                    aria-label={`Question ${item.paperNumber}, ${item.outcome}`}
                    aria-current={current ? "true" : undefined}
                    className={`grid ${compact ? "size-11" : "size-10"} place-items-center rounded-full border-2 text-[13px] font-semibold tabular-nums cursor-pointer transition-[transform,box-shadow,filter,background-color] duration-150 hover:scale-[1.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green ${CELL[item.outcome]} ${current ? CURRENT_RING : HOVER_LIFT}`}
                  >
                    {item.paperNumber}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

/** Legend used in the phone sheet. */
export function QuestionMapLegend() {
  const swatch = "inline-block size-3 rounded-md box-border";
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-[#51645a]">
      <li className="flex items-center gap-[5px]">
        <i aria-hidden className={`${swatch} bg-study-green`} />
        Correct
      </li>
      <li className="flex items-center gap-[5px]">
        <i
          aria-hidden
          className={`${swatch} border border-[#d9a18f] bg-[#f4d6cb]`}
        />
        Wrong
      </li>
      <li className="flex items-center gap-[5px]">
        <i
          aria-hidden
          className={`${swatch} border-[1.5px] border-dashed border-[#afaa9a] bg-white`}
        />
        Skipped
      </li>
      <li className="flex items-center gap-[5px]">
        <i
          aria-hidden
          className={`${swatch} bg-white shadow-[0_0_0_1.5px_#173b2f]`}
        />
        You are here
      </li>
    </ul>
  );
}

type ResultsQuestionMapProps = QuestionMapFiltersProps &
  Omit<QuestionMapGridProps, "compact"> & {
    /** Mini score summary, shown once the full summary card has scrolled away. */
    miniSummary?: ReactNode;
  };

/**
 * Desktop sidebar card. It sticks to the viewport while the answer key scrolls
 * and scrolls internally, so 180 circles never push the page.
 */
export function ResultsQuestionMap({
  miniSummary,
  groups,
  currentPaperNumber,
  onJump,
  ...filters
}: ResultsQuestionMapProps) {
  return (
    <section
      aria-labelledby="question-map-heading"
      className="flex max-h-[calc(100dvh-2rem)] flex-col gap-2.5 rounded-[24px] border border-study-divider bg-white p-[18px] shadow-soft"
    >
      {miniSummary}
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="question-map-heading"
          className="font-display text-[17px] font-bold text-study-ink"
        >
          Question map
        </h2>
        <p className="text-xs text-study-muted-soft">Tap to jump</p>
      </div>
      <QuestionMapFilters {...filters} />
      <div className="-mx-1.5 min-h-0 flex-1 overflow-y-auto py-1.5 pr-3.5 pl-1.5 [scrollbar-width:thin]">
        <QuestionMapGrid
          groups={groups}
          currentPaperNumber={currentPaperNumber}
          onJump={onJump}
        />
      </div>
    </section>
  );
}

export function answerKeyQuestionDomId(paperNumber: number): string {
  return `answer-key-q-${paperNumber}`;
}
