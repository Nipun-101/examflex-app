"use client";

import { Check, Pause, Play } from "lucide-react";
import { StudyButton } from "@/components/study/study-button";
import { countStatus } from "@/lib/mocks/question-status";
import type { QuestionStatus } from "@/types/attempt-runner";

type QuestionPaletteProps = {
  statuses: readonly QuestionStatus[];
  currentIndex: number;
  onSelect: (index: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  testTitle: string;
  /** Session-wise papers show the section name instead of "Question Palette". */
  sectionTitle?: string;
  onSubmit: () => void;
  submitLabel: string;
};

const STATUS_LABEL: Record<QuestionStatus, string> = {
  answered: "answered",
  "not-answered": "not answered",
  marked: "marked for review",
  "marked-answered": "answered and marked for review",
  "not-visited": "not visited",
};

const STATUS_CLASS: Record<QuestionStatus, string> = {
  answered: "bg-study-green text-white hover:brightness-110",
  "not-answered": "bg-study-peach text-study-peach-ink hover:brightness-95",
  marked: "bg-study-lilac text-study-ink ring-1 ring-study-ink/25 hover:brightness-95",
  "marked-answered":
    "bg-study-lilac text-study-ink ring-1 ring-study-ink/25 hover:brightness-95",
  "not-visited":
    "border border-study-divider bg-white text-study-muted-soft hover:bg-study-mint",
};

const LEGEND: ReadonlyArray<{ status: QuestionStatus; label: string }> = [
  { status: "answered", label: "Answered" },
  { status: "not-answered", label: "Not Answered" },
  { status: "marked", label: "Marked" },
  { status: "marked-answered", label: "Marked & Answered" },
  { status: "not-visited", label: "Not Visited" },
];

function MarkedAnsweredBadge() {
  return (
    <Check
      className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-study-green p-0.5 text-white"
      strokeWidth={3}
      aria-hidden
    />
  );
}

export function QuestionPalette({
  statuses,
  currentIndex,
  onSelect,
  isPaused,
  onTogglePause,
  testTitle,
  sectionTitle,
  onSubmit,
  submitLabel,
}: QuestionPaletteProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-0.5">
        <div className="border-b border-study-divider pb-4">
          <p className="truncate font-display text-sm font-semibold text-study-ink">
            {testTitle}
          </p>
          <p className="text-xs text-study-muted-soft">
            {sectionTitle ?? "Mock Test Attempt"}
          </p>
        </div>

        <StudyButton
          variant="surface"
          onClick={onTogglePause}
          className="inline-flex h-11 w-full items-center justify-start gap-2 rounded-[10px] px-3 text-sm font-semibold"
        >
          {isPaused ? (
            <Play className="h-4 w-4" aria-hidden />
          ) : (
            <Pause className="h-4 w-4" aria-hidden />
          )}
          {isPaused ? "Resume Test" : "Pause Test"}
        </StudyButton>

        <section aria-label="Legend" className="space-y-2">
          <h3 className="text-sm font-bold text-study-ink">Legend</h3>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            {LEGEND.map(({ status, label }) => (
              <li key={status} className="flex items-center gap-2">
                <span
                  className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold ${STATUS_CLASS[status]}`}
                >
                  {countStatus(statuses, status)}
                  {status === "marked-answered" ? <MarkedAnsweredBadge /> : null}
                </span>
                <span className="font-medium text-study-ink">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Question palette" className="space-y-2">
          <h3 className="text-xs font-semibold text-study-muted-soft">
            {sectionTitle ? `${sectionTitle} :` : "Question Palette:"}
          </h3>
          <div className="grid max-h-[18.75rem] grid-cols-5 gap-2 overflow-y-auto p-1 pr-2">
            {statuses.map((status, index) => {
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={`Question ${index + 1}, ${STATUS_LABEL[status]}`}
                  {...(isCurrent ? { "aria-current": "true" as const } : {})}
                  className={`relative h-11 cursor-pointer rounded-md text-sm font-bold transition-colors lg:h-10 lg:text-[13px] ${
                    isCurrent
                      ? "bg-study-ink text-white ring-2 ring-study-green ring-offset-2"
                      : STATUS_CLASS[status]
                  }`}
                >
                  {index + 1}
                  {status === "marked-answered" && !isCurrent ? (
                    <MarkedAnsweredBadge />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-4 border-t border-study-divider pt-4">
        <StudyButton
          variant="solid"
          onClick={onSubmit}
          disabled={isPaused}
          className="inline-flex h-12 w-full items-center justify-center rounded-[10px] text-sm font-semibold"
        >
          {submitLabel}
        </StudyButton>
      </div>
    </div>
  );
}
