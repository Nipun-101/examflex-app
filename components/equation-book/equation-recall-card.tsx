import type { EquationCard } from "@/types/equation-book";

type EquationRecallCardProps = {
  card: EquationCard;
};

export function EquationRecallCard({ card }: EquationRecallCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[20px] bg-study-lilac px-5 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <p className="text-[0.625rem] font-semibold tracking-wide whitespace-pre-wrap text-study-green uppercase">
        {card.sourceLabel}
      </p>
      <h2 className="mt-3 font-display text-[1.5rem] font-semibold leading-[1.3] text-study-ink sm:text-[1.875rem] lg:mt-4 lg:text-[2.25rem]">
        {card.promptTitle}
      </h2>
      <p className="mt-4 text-sm leading-[1.5] text-study-muted-soft sm:text-base">
        {card.recallHint}
      </p>

      <div className="my-6 h-px w-full bg-[#d1cedf] lg:my-8" aria-hidden />

      <div className="mt-auto flex flex-col">
        <p className="text-[0.625rem] font-semibold tracking-wide text-study-muted-soft uppercase">
          {card.answerLabel}
        </p>
        <p className="mt-3 font-display text-[1.375rem] font-medium leading-[1.35] text-study-ink sm:text-[1.75rem] lg:text-[2rem]">
          {card.equation}
        </p>
        <p className="mt-4 text-sm leading-[1.5] text-study-ink sm:text-base lg:mt-5">
          {card.note}
        </p>
      </div>
    </article>
  );
}
