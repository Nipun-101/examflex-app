"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type EquationPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

const BUTTON_CLASS =
  "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-[10px] border border-study-divider bg-white px-3 text-sm font-semibold text-study-ink transition enabled:hover:bg-study-mint disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green";

/** First / Previous / "Page X of Y" / Next / Last. Hidden when there is one page. */
export function EquationPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: EquationPaginationProps) {
  if (totalPages <= 1) return null;

  const onFirst = page <= 1;
  const onLast = page >= totalPages;

  return (
    <nav
      aria-label="Equation pages"
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
    >
      <button
        type="button"
        aria-label="First page"
        className={BUTTON_CLASS}
        disabled={disabled || onFirst}
        onClick={() => onPageChange(1)}
      >
        <ChevronsLeft className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Previous page"
        className={BUTTON_CLASS}
        disabled={disabled || onFirst}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Previous</span>
      </button>
      <p
        aria-live="polite"
        className="px-2 text-sm whitespace-nowrap text-study-muted-soft"
      >
        Page {page} of {totalPages}
      </p>
      <button
        type="button"
        aria-label="Next page"
        className={BUTTON_CLASS}
        disabled={disabled || onLast}
        onClick={() => onPageChange(page + 1)}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Last page"
        className={BUTTON_CLASS}
        disabled={disabled || onLast}
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
