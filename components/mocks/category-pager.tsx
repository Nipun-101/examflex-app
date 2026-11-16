"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type CategoryPagerProps = {
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
};

/** Prev/Next for one-category-per-page hub browsing. Hidden when only one page. */
export function CategoryPager({
  page,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPrev,
  onNext,
}: CategoryPagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrevPage}
        aria-label="Previous category"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-study-divider bg-white text-study-ink transition enabled:hover:bg-study-mint disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNextPage}
        aria-label="Next category"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-study-divider bg-white text-study-ink transition enabled:hover:bg-study-mint disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
      <span className="sr-only">
        Category {page} of {totalPages}
      </span>
    </div>
  );
}

export function categoryPagerHint(page: number, totalPages: number): string {
  return `Category ${page} of ${totalPages} — use the arrows to switch boards.`;
}
