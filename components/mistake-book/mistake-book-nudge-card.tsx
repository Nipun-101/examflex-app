import { MISTAKE_BOOK_COPY } from "@/types/mistake-book";

export function MistakeBookNudgeCard() {
  return (
    <aside className="rounded-[18px] bg-study-lilac px-5 py-4 shadow-soft sm:px-5 sm:py-5">
      <p className="text-[0.625rem] font-semibold tracking-[0.14em] text-study-lilac-ink uppercase">
        {MISTAKE_BOOK_COPY.nudgeEyebrow}
      </p>
      <p className="mt-2 font-display text-lg font-semibold text-study-ink">
        {MISTAKE_BOOK_COPY.nudgeTitle}
      </p>
      <p className="mt-1 text-sm text-study-muted-soft">
        {MISTAKE_BOOK_COPY.nudgeBody}
      </p>
    </aside>
  );
}
