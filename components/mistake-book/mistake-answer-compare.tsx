import type { MistakeItem } from "@/types/mistake-book";

type MistakeAnswerCompareProps = {
  mistake: MistakeItem;
};

export function MistakeAnswerCompare({ mistake }: MistakeAnswerCompareProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
      <div className="rounded-[12px] bg-study-peach px-4 py-4 ring-1 ring-study-peach-ink/20 sm:min-h-[6.5rem] lg:px-5 lg:py-5">
        <p className="text-[0.625rem] font-semibold tracking-wide text-study-peach-ink uppercase">
          {mistake.yourAnswerLabel}
        </p>
        <p className="mt-3 font-display text-xl font-semibold text-study-ink sm:text-2xl">
          {mistake.yourAnswer}
        </p>
      </div>
      <div className="rounded-[12px] bg-study-mint px-4 py-4 ring-1 ring-study-green/15 sm:min-h-[6.5rem] lg:px-5 lg:py-5">
        <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
          {mistake.correctAnswerLabel}
        </p>
        <p className="mt-3 font-display text-xl font-semibold text-study-ink sm:text-2xl">
          {mistake.correctAnswer}
        </p>
      </div>
    </div>
  );
}
