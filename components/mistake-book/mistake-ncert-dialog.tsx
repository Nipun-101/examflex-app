"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AttemptImage } from "@/components/attempt/attempt-image";
import { MathText } from "@/components/attempt/math-text";
import { MistakeNcertChips } from "@/components/mistake-book/mistake-ncert-chips";
import { StudyButton } from "@/components/study/study-button";
import { splitCitationFigures } from "@/lib/mistake-book/citation";
import { lockBodyScroll } from "@/lib/study/body-scroll-lock";
import type { MistakeCitation } from "@/types/mistake-book";

type MistakeNcertDialogProps = {
  open: boolean;
  onClose: () => void;
  citation: MistakeCitation;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Full NCERT passage: a centred modal on larger screens, a bottom sheet on
 * phones. Portaled to <body>; React context (Mathpix) still flows through.
 */
export function MistakeNcertDialog({
  open,
  onClose,
  citation,
}: MistakeNcertDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const unlockScroll = lockBodyScroll();
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      opener?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const { text, figures } = splitCitationFigures(
    citation.content,
    citation.images
  );

  function trapTab(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-study-ink/50 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapTab}
        className="ncert-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-[28px] bg-white shadow-lift outline-none sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-[28px] lg:max-w-4xl"
      >
        <div
          aria-hidden
          className="mx-auto mt-2.5 h-[5px] w-11 shrink-0 rounded-[3px] bg-[#d9d5c8] sm:hidden"
        />

        <header className="shrink-0 border-b border-study-divider px-5 pt-4 pb-5 sm:px-8 sm:pt-7 sm:pb-6 lg:px-11">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
              NCERT reference
            </p>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close NCERT reference"
              onClick={onClose}
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#f2efe6] text-study-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green"
            >
              <X className="size-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <h2
            id={titleId}
            className="mt-1 font-display text-xl leading-snug font-bold text-study-ink sm:text-2xl"
          >
            {citation.title}
          </h2>
          <MistakeNcertChips citation={citation} className="mt-3" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 lg:px-11">
          <div className="ncert-reference-content text-[0.9375rem] leading-[1.7] text-study-ink lg:text-base">
            <MathText text={text} />
          </div>
          {figures.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {figures.map((figure) => (
                <figure
                  key={figure.src}
                  className="flex flex-col items-center gap-2 rounded-[14px] border border-study-divider bg-study-canvas p-3"
                >
                  <AttemptImage
                    src={figure.src}
                    alt={figure.alt}
                    className="max-h-72 bg-white object-contain"
                  />
                  {figure.caption ? (
                    <figcaption className="text-center text-xs text-study-muted-soft">
                      {figure.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-study-divider px-5 py-4 sm:px-8 lg:px-11">
          <p className="min-w-0 text-xs text-study-muted-soft sm:text-[0.8125rem]">
            Matched to your NCERT edition
          </p>
          <StudyButton
            variant="surface"
            onClick={onClose}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[12px] px-6 text-sm font-semibold"
          >
            Close
          </StudyButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}
