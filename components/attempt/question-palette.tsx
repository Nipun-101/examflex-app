"use client";

import { Check, Pause, Play } from "lucide-react";
import { StudyButton } from "@/components/study/study-button";
import { countStatus } from "@/lib/mocks/question-status";
import type { PaletteGroup } from "@/lib/mocks/palette-groups";
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
  /** Full mocks: palette buttons grouped under each subject's name. */
  groups?: readonly PaletteGroup[];
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

/** ExamFlex lilac-ink purple — inline style so marked swatches never paint transparent. */
const MARKED_FILL = "#4f446c";

/**
 * Status hues follow ezprep’s palette roles (answered / not-answered / marked /
 * current) remapped onto ExamFlex study tokens for stronger contrast.
 */
const STATUS_CLASS: Record<QuestionStatus, string> = {
  answered: "bg-study-green text-white hover:brightness-110",
  "not-answered": "bg-study-peach-ink text-white hover:brightness-110",
  marked: "text-white hover:brightness-110",
  "marked-answered": "text-white hover:brightness-110",
  "not-visited":
    "border border-study-divider bg-study-mint-bar/60 text-study-ink hover:bg-study-mint",
};

function statusStyle(
  status: QuestionStatus,
): { backgroundColor: string } | undefined {
  if (status === "marked" || status === "marked-answered") {
    return { backgroundColor: MARKED_FILL };
  }
  return undefined;
}

const CURRENT_CLASS =
  "bg-study-lime text-study-ink ring-2 ring-study-ink ring-offset-2 hover:brightness-95";

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
      className="absolute right-0 bottom-0 h-3.5 w-3.5 translate-x-1/4 translate-y-1/4 rounded-full bg-study-green p-0.5 text-white shadow-sm"
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
  groups,
  onSubmit,
  submitLabel,
}: QuestionPaletteProps) {
  const renderQuestionButton = (index: number) => {
    const status = statuses[index];
    if (!status) return null;
    const isCurrent = index === currentIndex;
    return (
      <button
        key={index}
        type="button"
        onClick={() => onSelect(index)}
        aria-label={`Question ${index + 1}, ${STATUS_LABEL[status]}`}
        {...(isCurrent ? { "aria-current": "true" as const } : {})}
        className={`relative h-11 cursor-pointer rounded-md text-sm font-bold shadow-sm transition-colors lg:h-10 lg:text-[13px] ${
          isCurrent ? CURRENT_CLASS : STATUS_CLASS[status]
        }`}
        style={isCurrent ? undefined : statusStyle(status)}
      >
        {index + 1}
        {status === "marked-answered" && !isCurrent ? (
          <MarkedAnsweredBadge />
        ) : null}
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-1">
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

        <section aria-label="Legend" className="space-y-2.5">
          <h3 className="text-sm font-bold text-study-ink">Legend</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            {LEGEND.map(({ status, label }) => (
              <li key={status} className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold shadow-sm ${STATUS_CLASS[status]}`}
                  style={statusStyle(status)}
                >
                  {countStatus(statuses, status)}
                  {status === "marked-answered" ? (
                    <MarkedAnsweredBadge />
                  ) : null}
                </span>
                <span className="leading-snug font-medium text-study-ink">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Question palette" className="space-y-2.5">
          <h3 className="text-xs font-semibold text-study-muted-soft">
            {sectionTitle ? `${sectionTitle} :` : "Question Palette:"}
          </h3>
          {groups ? (
            <div className="max-h-[18.75rem] space-y-4 overflow-y-auto p-1.5">
              {groups.map((group) => (
                <div
                  key={group.id}
                  role="group"
                  aria-label={group.name}
                  className="space-y-2"
                >
                  <h4 className="truncate text-xs font-bold text-study-ink">
                    {group.name}
                    <span className="ml-1.5 font-medium text-study-muted-soft">
                      · {group.indices.length}
                    </span>
                  </h4>
                  <div className="grid grid-cols-5 gap-2.5">
                    {group.indices.map(renderQuestionButton)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid max-h-[18.75rem] grid-cols-5 gap-2.5 overflow-y-auto p-1.5">
              {statuses.map((_, index) => renderQuestionButton(index))}
            </div>
          )}
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
