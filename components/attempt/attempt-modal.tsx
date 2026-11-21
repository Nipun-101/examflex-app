"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

type AttemptModalProps = {
  open: boolean;
  /** Backdrop click and Escape. Ignored when `dismissible` is false. */
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  /**
   * `sheet` slides in from the right (mobile palette). `lightbox` shrink-wraps
   * its content (a picture) and never exceeds the viewport.
   */
  variant?: "dialog" | "sheet" | "lightbox";
  dismissible?: boolean;
  /** Extra classes for the dialog panel (e.g. wider booking forms). */
  panelClassName?: string;
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Accessible modal: focus moves in, Tab is trapped, Escape closes, focus returns. */
export function AttemptModal({
  open,
  onClose,
  labelledBy,
  describedBy,
  variant = "dialog",
  dismissible = true,
  panelClassName = "",
  children,
}: AttemptModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    panelRef.current?.focus();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);

  if (!open) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      if (dismissible) {
        event.stopPropagation();
        onClose();
      }
      return;
    }
    if (event.key !== "Tab") return;

    const panel = event.currentTarget;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE)
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const isSheet = variant === "sheet";
  const panelClass = isSheet
    ? `h-full w-[88%] max-w-sm overflow-y-auto bg-white p-4 shadow-lift outline-none sm:p-5 ${panelClassName}`
    : variant === "lightbox"
      ? `max-h-[94dvh] w-auto max-w-[min(96vw,64rem)] overflow-auto rounded-[20px] border border-study-divider bg-white p-3 shadow-lift outline-none sm:p-4 ${panelClassName}`
      : `max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[20px] border border-study-divider bg-white p-5 shadow-lift outline-none sm:p-6 ${panelClassName}`;

  return (
    <div
      className={`fixed inset-0 z-[70] flex bg-study-ink/50 backdrop-blur-[2px] ${
        isSheet ? "justify-end" : "items-center justify-center p-3 sm:p-4"
      }`}
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        {...(describedBy ? { "aria-describedby": describedBy } : {})}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={panelClass.trim()}
      >
        {children}
      </div>
    </div>
  );
}
