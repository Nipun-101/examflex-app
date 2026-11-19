import { EquationBrowseLink } from "@/components/equation-book/equation-actions";
import { EQUATION_BOOK_COPY } from "@/types/equation-book";

type EquationEmptyStateProps = {
  chapterLabel?: string;
};

function EmptyDeckIllustration({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto h-[9.5rem] w-[11.5rem] shrink-0 sm:h-[10.5rem] sm:w-[12.5rem] ${className}`.trim()}
      aria-hidden
    >
      <div className="absolute top-6 left-2 h-[7.25rem] w-[8.5rem] -rotate-[14deg] rounded-[14px] bg-[#dfe9d4] shadow-soft" />
      <div className="absolute top-4 left-6 h-[7.25rem] w-[8.5rem] rotate-[8deg] rounded-[14px] bg-[#f3efc8] shadow-soft" />
      <div className="absolute top-2 left-10 flex h-[7.75rem] w-[8.75rem] flex-col items-center justify-center rounded-[14px] border border-dashed border-study-ink/35 bg-white px-3 text-center shadow-soft">
        <p className="text-[0.5625rem] font-semibold tracking-wide text-study-muted-soft uppercase">
          Your first card
        </p>
        <p className="mt-3 font-display text-[1.75rem] font-semibold leading-none text-study-ink">
          F = ?
        </p>
        <span className="mt-3 h-px w-12 border-t border-dashed border-study-ink/40" />
      </div>
    </div>
  );
}

function ChapterSkeletonList() {
  return (
    <ul className="mt-4 space-y-3">
      {["01", "02", "03", "04"].map((index) => (
        <li key={index} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-study-muted-soft">
            {index}
          </span>
          <span className="h-2.5 flex-1 rounded-full bg-[#e8e4d8]" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Empty Equation Book content (desktop + mobile) — keeps page chrome/filters intact.
 */
export function EquationEmptyState({ chapterLabel }: EquationEmptyStateProps) {
  const sessionTitle = chapterLabel?.trim() ? chapterLabel : "No chapter yet";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)] lg:items-stretch lg:gap-6">
      <article className="relative overflow-hidden rounded-[20px] bg-study-lilac px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(79,68,108,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(79,68,108,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          <EmptyDeckIllustration className="order-1 lg:order-2 lg:mx-0" />

          <div className="order-2 min-w-0 lg:order-1 lg:flex-1">
            <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
              {EQUATION_BOOK_COPY.emptyEyebrow}
            </p>
            <h2 className="mt-3 font-display text-[1.625rem] font-semibold leading-[1.2] text-study-ink sm:text-[1.875rem] lg:text-[2.125rem]">
              {EQUATION_BOOK_COPY.emptyTitle}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-[1.5] text-study-muted-soft sm:text-[0.9375rem]">
              {EQUATION_BOOK_COPY.emptyBody}
            </p>
            <div className="mt-5 sm:mt-6">
              <EquationBrowseLink className="w-full bg-white/70 sm:w-auto" />
            </div>
          </div>
        </div>
      </article>

      <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
        <article className="rounded-[20px] bg-white px-5 py-5 shadow-soft sm:px-6">
          <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
            Recall session
          </p>
          <h3 className="mt-2 min-w-0 font-display text-lg font-semibold break-words text-study-ink">
            {sessionTitle}
          </h3>
          <p className="mt-2 text-sm leading-[1.45] text-study-muted-soft">
            Card 0 of 0. Keep going until the chapter feels automatic.
          </p>
        </article>

        <article className="rounded-[20px] bg-white px-5 py-5 shadow-soft sm:px-6 lg:flex-1">
          <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
            In this chapter
          </p>
          <div className="mt-3 h-px w-full bg-study-divider" aria-hidden />
          <ChapterSkeletonList />
        </article>
      </div>
    </div>
  );
}
