"use client";

import { MathText } from "@/components/attempt/math-text";
import { MISTAKE_BOOK_COPY, type MistakeItem } from "@/types/mistake-book";

type MistakeAnswerCompareProps = {
  mistake: MistakeItem;
};

export function MistakeAnswerCompare({ mistake }: MistakeAnswerCompareProps) {
  const unattended = mistake.kind === "unattended";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
      <div
        className={
          unattended
            ? "rounded-[12px] bg-study-divider/60 px-4 py-4 ring-1 ring-study-ink/10 sm:min-h-[6.5rem] lg:px-5 lg:py-5"
            : "rounded-[12px] bg-study-peach px-4 py-4 ring-1 ring-study-peach-ink/20 sm:min-h-[6.5rem] lg:px-5 lg:py-5"
        }
      >
        <p
          className={
            unattended
              ? "text-[0.625rem] font-semibold tracking-wide text-study-muted-soft uppercase"
              : "text-[0.625rem] font-semibold tracking-wide text-study-peach-ink uppercase"
          }
        >
          {unattended
            ? "YOUR ANSWER"
            : (mistake.yourAnswerLabel ?? "YOUR ANSWER")}
        </p>
        <div className="mt-3 font-display text-xl font-semibold text-study-ink sm:text-2xl">
          {unattended ? (
            MISTAKE_BOOK_COPY.unattendedHint
          ) : (
            <MathText text={mistake.yourAnswer} />
          )}
        </div>
      </div>
      <div className="rounded-[12px] bg-study-mint px-4 py-4 ring-1 ring-study-green/15 sm:min-h-[6.5rem] lg:px-5 lg:py-5">
        <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
          {mistake.correctAnswerLabel}
        </p>
        <div className="mt-3 font-display text-xl font-semibold text-study-ink sm:text-2xl">
          <MathText text={mistake.correctAnswer} />
        </div>
      </div>
    </div>
  );
}
