"use client";

import { useEffect, useRef } from "react";
import { BookMarked, Clock, LayoutGrid, TrendingUp, X } from "lucide-react";
import {
  QuestionMapFilters,
  QuestionMapGrid,
  QuestionMapLegend,
  type ResultsMapGroup,
  type ResultsMapSection,
  type ResultsMapStatusCounts,
  type ResultsStatusFilter,
} from "@/components/attempt/results-question-map";
import { lockBodyScroll } from "@/lib/study/body-scroll-lock";
import { StudyControlLink } from "@/components/study/study-button";

type ResultsMapSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Score strip: "40 of 180 · 26.0% · 7m 56s". */
  correct: number;
  total: number;
  accuracy: string;
  timeLabel: string;
  statusFilter: ResultsStatusFilter;
  onStatusChange: (filter: ResultsStatusFilter) => void;
  statusCounts: ResultsMapStatusCounts;
  sections: readonly ResultsMapSection[];
  sectionFilter: number | null;
  onSectionChange: (sectionId: number | null) => void;
  groups: readonly ResultsMapGroup[];
  currentPaperNumber: number | null;
  onJump: (paperNumber: number) => void;
  /** Href for the "Review mistakes" button; omit to hide it. */
  mistakeHref?: string;
  mistakeCount: number;
};

/** Phone bottom sheet with the full question map, filters and mistake shortcut. */
export function ResultsMapSheet({
  open,
  onClose,
  correct,
  total,
  accuracy,
  timeLabel,
  statusFilter,
  onStatusChange,
  statusCounts,
  sections,
  sectionFilter,
  onSectionChange,
  groups,
  currentPaperNumber,
  onJump,
  mistakeHref,
  mistakeCount,
}: ResultsMapSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const unlockScroll = lockBodyScroll();
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-[#0f201c]/55"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-map-sheet-heading"
        className="study-sheet-up absolute inset-x-0 bottom-0 flex h-[min(690px,88dvh)] flex-col gap-2.5 rounded-t-[28px] bg-white px-[18px] pt-2.5 pb-5 shadow-[0_-10px_40px_rgba(0,0,0,0.25)]"
      >
        <div
          aria-hidden
          className="mx-auto mb-1.5 h-[5px] w-11 shrink-0 rounded-[3px] bg-[#d9d5c8]"
        />
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <h2
              id="question-map-sheet-heading"
              className="font-display text-lg font-bold text-study-ink"
            >
              Question map
            </h2>
            <p className="text-xs text-study-muted-soft">
              Tap a number to jump
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close question map"
            onClick={onClose}
            className="grid size-11 cursor-pointer place-items-center rounded-full bg-[#f2efe6] text-study-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green"
          >
            <X className="size-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-[12px] bg-[#f3f0e8] px-3 py-[9px] text-xs font-medium text-[#51645a]">
          <b className="text-[13px] text-study-ink">
            {correct} of {total}
          </b>
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-3.5" strokeWidth={2.4} aria-hidden />
            {accuracy}%
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" strokeWidth={2.4} aria-hidden />
            {timeLabel}
          </span>
        </div>

        <div className="shrink-0">
          <QuestionMapFilters
            statusFilter={statusFilter}
            onStatusChange={onStatusChange}
            statusCounts={statusCounts}
            sections={sections}
            sectionFilter={sectionFilter}
            onSectionChange={onSectionChange}
          />
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="-mx-1.5 h-full overflow-y-auto pt-1.5 pr-3.5 pb-4 pl-1.5">
            <QuestionMapGrid
              groups={groups}
              currentPaperNumber={currentPaperNumber}
              onJump={onJump}
              compact
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-b from-white/0 to-white"
          />
        </div>

        <div className="shrink-0">
          <QuestionMapLegend />
        </div>

        {mistakeHref && mistakeCount > 0 ? (
          <StudyControlLink
            href={mistakeHref}
            variant="solid"
            className="inline-flex min-h-[50px] w-full shrink-0 items-center justify-center gap-2.5 rounded-[14px] px-5 text-[15px] font-semibold"
          >
            <BookMarked className="size-[18px]" aria-hidden />
            Review mistakes · {mistakeCount}
          </StudyControlLink>
        ) : null}
      </div>
    </div>
  );
}

type MapPillProps = {
  currentPaperNumber: number | null;
  total: number;
  onOpen: () => void;
};

/** Floating phone button that opens the map sheet and shows where you are. */
export function QuestionMapPill({
  currentPaperNumber,
  total,
  onOpen,
}: MapPillProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="fixed bottom-[max(1.375rem,env(safe-area-inset-bottom))] left-1/2 z-30 inline-flex h-[52px] -translate-x-1/2 cursor-pointer items-center gap-2.5 rounded-[26px] bg-study-ink px-[22px] text-sm font-semibold whitespace-nowrap text-white shadow-[0_10px_24px_rgba(23,59,47,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green lg:hidden"
    >
      <LayoutGrid className="size-5" aria-hidden />
      Question map
      <span aria-hidden className="h-[18px] w-px bg-white/30" />
      <span className="text-study-lime">
        Q{currentPaperNumber ?? "–"} / {total}
      </span>
    </button>
  );
}
