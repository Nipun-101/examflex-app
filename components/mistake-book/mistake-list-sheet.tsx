"use client";

import { useEffect, useRef } from "react";
import { List, X } from "lucide-react";
import { StudyButton } from "@/components/study/study-button";
import { mistakeRailLabel } from "@/lib/mistake-book/rail-label";
import { lockBodyScroll } from "@/lib/study/body-scroll-lock";
import type { MistakeItem } from "@/types/mistake-book";

type MistakeListSheetProps = {
  open: boolean;
  onClose: () => void;
  mockLabel: string;
  mistakes: readonly MistakeItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

/**
 * Phone bottom sheet with every mistake in the review, mirroring the
 * desktop "In this review" rail. Picking one jumps to that card and closes.
 */
export function MistakeListSheet({
  open,
  onClose,
  mockLabel,
  mistakes,
  activeIndex,
  onSelect,
}: MistakeListSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const unlockScroll = lockBodyScroll();
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    activeRef.current?.scrollIntoView?.({ block: "center" });

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
        aria-labelledby="mistake-list-sheet-heading"
        className="study-sheet-up absolute inset-x-0 bottom-0 flex h-[min(620px,82dvh)] flex-col gap-2.5 rounded-t-[28px] bg-white px-[18px] pt-2.5 pb-5 shadow-[0_-10px_40px_rgba(0,0,0,0.25)]"
      >
        <div
          aria-hidden
          className="mx-auto mb-1.5 h-[5px] w-11 shrink-0 rounded-[3px] bg-[#d9d5c8]"
        />
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="mistake-list-sheet-heading"
              className="font-display text-lg font-bold text-study-ink"
            >
              In this review
            </h2>
            <p className="truncate text-xs text-study-muted-soft">
              {mistakes.length} {mistakes.length === 1 ? "mistake" : "mistakes"}{" "}
              left
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close mistake list"
            onClick={onClose}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#f2efe6] text-study-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green"
          >
            <X className="size-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <ul className="h-full space-y-1 overflow-y-auto pr-1 pb-4">
            {mistakes.map((mistake, index) => {
              const active = index === activeIndex;
              const label = mistakeRailLabel(mistake, mockLabel);
              return (
                <li key={mistake.id} ref={active ? activeRef : undefined}>
                  <StudyButton
                    variant={active ? "railActive" : "rail"}
                    aria-current={active ? "true" : undefined}
                    onClick={() => {
                      onSelect(index);
                      onClose();
                    }}
                    className="flex min-h-11 w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left"
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-xs font-semibold tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-snug font-medium">
                      {label}
                    </span>
                  </StudyButton>
                </li>
              );
            })}
          </ul>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-b from-white/0 to-white"
          />
        </div>
      </div>
    </div>
  );
}

type MistakeListTriggerProps = {
  current: number;
  total: number;
  onOpen: () => void;
};

/** Phone-only row that opens the mistake list sheet. */
export function MistakeListTrigger({
  current,
  total,
  onOpen,
}: MistakeListTriggerProps) {
  return (
    <StudyButton
      variant="outline"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="inline-flex h-12 w-full items-center justify-between gap-3 rounded-[12px] px-4 text-[0.8125rem] font-medium lg:hidden"
    >
      <span className="inline-flex items-center gap-2">
        <List className="size-4" aria-hidden />
        All mistakes in this review
      </span>
      <span className="text-study-green tabular-nums">
        {current} / {total}
      </span>
    </StudyButton>
  );
}
