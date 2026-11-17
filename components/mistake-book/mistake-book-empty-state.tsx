import { MistakeBookEmptyIllustration } from "@/components/mistake-book/mistake-book-empty-illustration";
import { MISTAKE_BOOK_EMPTY_CONTENT } from "@/lib/mistake-book/empty-content";
import { MISTAKE_BOOK_COPY } from "@/types/mistake-book";

const selectClassName =
  "h-[48px] w-full cursor-not-allowed appearance-none rounded-[12px] border border-study-divider bg-white px-4 pr-10 text-center text-[0.875rem] font-medium text-study-ink";

function EmptyFilters() {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <div className="relative">
        <label className="sr-only" htmlFor="mistake-empty-subject">
          Subject
        </label>
        <select
          id="mistake-empty-subject"
          aria-label="Subject"
          disabled
          className={selectClassName}
          defaultValue="all"
        >
          <option value="all">All subjects</option>
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-study-ink"
        >
          ▾
        </span>
      </div>
      <div className="relative">
        <label className="sr-only" htmlFor="mistake-empty-chapter">
          Chapter
        </label>
        <select
          id="mistake-empty-chapter"
          aria-label="Chapter"
          disabled
          className={selectClassName}
          defaultValue="all"
        >
          <option value="all">All chapters</option>
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-study-ink"
        >
          ▾
        </span>
      </div>
    </div>
  );
}

function HeroCard() {
  const content = MISTAKE_BOOK_EMPTY_CONTENT;

  return (
    <section
      aria-label="Mistake Book empty"
      className="relative flex h-full min-h-[100%] flex-col overflow-hidden rounded-[24px] bg-study-lilac px-5 py-6 sm:px-7 sm:py-7 lg:min-h-full lg:px-8 lg:py-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--study-lilac-ink) 22%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--study-lilac-ink) 22%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Large notebook art — claims the right half and reaches left into the copy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-3 right-1 hidden w-[52%] items-center justify-center sm:flex md:inset-y-4 md:right-2 md:w-[54%] lg:w-[56%]"
      >
        <MistakeBookEmptyIllustration className="h-full w-auto max-w-full object-contain" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col sm:max-w-[55%] sm:justify-center md:max-w-[52%] lg:max-w-[50%] lg:pr-2">
        {/* Mobile: large centered notebook above the copy stack */}
        <div className="mb-5 flex justify-center pt-1 sm:hidden">
          <MistakeBookEmptyIllustration className="h-[13.5rem] w-auto max-w-[15rem]" />
        </div>

        <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-study-green uppercase">
          {content.heroEyebrow}
        </p>
        <h2 className="mt-2.5 font-display text-[1.875rem] font-semibold tracking-tight text-study-ink sm:mt-3 sm:text-[2.375rem] lg:text-[2.75rem] lg:leading-[1.08]">
          Nothing to review.
          <br />
          Yet.
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-study-muted-soft sm:mt-4 sm:text-[1.0625rem] lg:mt-5 lg:text-[1.1875rem] lg:leading-[1.5]">
          {content.heroBody}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2 lg:mt-5">
          {content.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-study-divider/90 bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-study-ink sm:text-sm"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ReviewSessionCard() {
  const content = MISTAKE_BOOK_EMPTY_CONTENT;

  return (
    <section className="rounded-[20px] bg-white px-5 py-5 shadow-soft sm:px-6 sm:py-6">
      <p className="text-[0.625rem] font-semibold tracking-[0.06em] text-study-green uppercase">
        {content.reviewEyebrow}
      </p>
      <p className="mt-2 font-display text-lg font-semibold text-study-ink">
        {content.reviewTitle}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-study-muted-soft">
        {content.reviewBody}
      </p>
    </section>
  );
}

function FillUpCard() {
  const content = MISTAKE_BOOK_EMPTY_CONTENT;

  return (
    <section
      aria-labelledby="mistake-book-fill-heading"
      className="rounded-[20px] bg-white px-5 py-5 shadow-soft sm:px-6 sm:py-6"
    >
      <h3
        id="mistake-book-fill-heading"
        className="text-[0.625rem] font-semibold tracking-[0.06em] text-study-green uppercase"
      >
        {content.fillEyebrow}
      </h3>
      <ol className="mt-5">
        {content.steps.map((step, index) => (
          <li
            key={step.number}
            className={
              index < content.steps.length - 1
                ? "mb-4 border-b border-study-divider pb-4"
                : ""
            }
          >
            <div className="flex gap-3.5">
              <span className="w-6 shrink-0 pt-0.5 text-[0.8125rem] font-medium tabular-nums text-study-muted-soft">
                {step.number}
              </span>
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-semibold text-study-ink">
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-study-muted-soft">
                  {step.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Full empty state for Mistake Book when no sessions remain. */
export function MistakeBookEmptyState() {
  const content = MISTAKE_BOOK_EMPTY_CONTENT;

  return (
    <div
      className="flex w-full flex-col gap-5 lg:gap-6"
      data-testid="mistake-book-empty-state"
    >
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
          {MISTAKE_BOOK_COPY.title}
        </h1>
        <p className="text-sm text-study-muted-soft lg:text-base">
          {content.subtitle}
        </p>
      </header>

      <EmptyFilters />

      <div aria-hidden className="h-px w-full bg-study-divider" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
        <div className="min-w-0 lg:flex lg:flex-[1.75] lg:flex-col">
          <HeroCard />
        </div>
        <aside className="flex w-full flex-col gap-4 lg:w-[20.5rem] lg:shrink-0 xl:w-[22rem]">
          <ReviewSessionCard />
          <FillUpCard />
        </aside>
      </div>
    </div>
  );
}
