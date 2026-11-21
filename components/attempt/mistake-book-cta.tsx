import { BookMarked, PartyPopper } from "lucide-react";
import { StudyControlLink } from "@/components/study/study-button";
import { mistakeBookPath } from "@/lib/mocks/exam-test-routes";

type MistakeBookCtaProps = {
  /** Paper the attempt belongs to. Without it there is nowhere to link. */
  mockTestId: string | undefined;
  /** Wrong + skipped questions: exactly what the Mistake Book stores. */
  mistakeCount: number;
};

/**
 * Results-page shortcut to the Mistake Book for this paper. Stacks on mobile,
 * sits side by side on tablet, and stacks again inside the desktop sidebar.
 */
export function MistakeBookCta({ mockTestId, mistakeCount }: MistakeBookCtaProps) {
  if (!mockTestId) return null;

  if (mistakeCount <= 0) {
    return (
      <aside
        aria-label="Mistake Book"
        className="flex items-start gap-3 rounded-[20px] bg-study-mint px-4 py-3.5 shadow-soft sm:px-5"
      >
        <PartyPopper className="mt-0.5 h-4 w-4 shrink-0 text-study-green" aria-hidden />
        <p className="text-sm text-study-green">
          <span className="font-semibold">Clean sheet.</span> Nothing from this
          test needs a place in your Mistake Book.
        </p>
      </aside>
    );
  }

  const noun = mistakeCount === 1 ? "question" : "questions";

  return (
    <aside
      aria-label="Mistake Book"
      className="flex flex-col gap-4 rounded-[20px] bg-study-lilac px-4 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 lg:flex-col lg:items-stretch lg:gap-4"
    >
      <div className="min-w-0">
        <p className="text-[0.625rem] font-semibold tracking-[0.14em] text-study-lilac-ink uppercase">
          Mistake Book
        </p>
        <p className="mt-1.5 font-display text-base font-semibold text-study-ink sm:text-lg">
          {mistakeCount} {noun} saved from this test
        </p>
        <p className="mt-1 text-sm leading-snug text-study-muted-soft">
          Wrong and skipped answers are waiting for a calm second look. Review
          them now while the paper is fresh.
        </p>
      </div>
      <StudyControlLink
        href={mistakeBookPath(mockTestId)}
        variant="solid"
        className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-semibold whitespace-nowrap sm:w-auto lg:w-full"
      >
        <BookMarked className="h-4 w-4" aria-hidden />
        Review mistakes
      </StudyControlLink>
    </aside>
  );
}
