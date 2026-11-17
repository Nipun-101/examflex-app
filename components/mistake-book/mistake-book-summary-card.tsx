import Link from "next/link";
import { paperSubjectTheme } from "@/lib/mocks/paper-subject-theme";
import { subjectBarSegmentRadiusClass } from "@/lib/mistake-book/session-list";
import {
  MISTAKE_BOOK_COPY,
  type MistakeBookListSummary,
  type MistakeBookSubjectCount,
} from "@/types/mistake-book";

type MistakeBookSummaryCardProps = {
  summary: MistakeBookListSummary;
};

export function MistakeBookSummaryCard({
  summary,
}: MistakeBookSummaryCardProps) {
  const testsLabel =
    summary.sessionCount === 1
      ? MISTAKE_BOOK_COPY.summaryTestsSingular
      : MISTAKE_BOOK_COPY.summaryTestsPlural;
  const startHref = summary.startWith
    ? `/mistake-book/${summary.startWith.mockTestId}`
    : null;
  const barSubjects: MistakeBookSubjectCount[] = summary.bySubject.filter(
    (subject) => subject.count > 0
  );

  return (
    <section className="rounded-[22px] bg-study-ink px-5 py-5 text-white shadow-soft sm:px-6 sm:py-6">
      <p className="text-[0.625rem] font-semibold tracking-[0.14em] text-study-lime uppercase">
        {MISTAKE_BOOK_COPY.summaryEyebrow}
      </p>

      <p className="mt-3 text-[0.9375rem] leading-snug text-white sm:text-base">
        <span className="font-display text-[2.75rem] leading-none font-semibold tracking-tight sm:text-5xl">
          {summary.totalMistakes}
        </span>{" "}
        <span className="align-baseline">
          {MISTAKE_BOOK_COPY.summaryWaiting} {summary.sessionCount} {testsLabel}
        </span>
      </p>

      {summary.totalMistakes > 0 && barSubjects.length > 0 ? (
        <>
          <div className="mt-5 flex h-3 gap-2.5" aria-hidden>
            {barSubjects.map((subject, index) => {
              const theme = paperSubjectTheme(subject.label);
              return (
                <span
                  key={subject.id}
                  className={`h-full min-w-2 ${subjectBarSegmentRadiusClass(index, barSubjects.length)}`}
                  style={{
                    flexGrow: subject.count,
                    flexBasis: 0,
                    backgroundColor: theme.summaryBarColor,
                  }}
                />
              );
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90">
            {barSubjects.map((subject) => (
              <li key={subject.id} className="font-medium">
                {subject.label} {subject.count}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-white/90">
        {MISTAKE_BOOK_COPY.summaryBlurb}
      </p>

      {startHref && summary.startWith ? (
        <Link
          href={startHref}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-study-lime px-5 text-sm font-semibold text-study-ink transition-[filter] hover:brightness-105"
        >
          {MISTAKE_BOOK_COPY.startWithPrefix} {summary.startWith.title} →
        </Link>
      ) : null}
    </section>
  );
}
