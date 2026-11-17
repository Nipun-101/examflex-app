"use client";

import { MathText } from "@/components/attempt/math-text";
import type { MistakeItem } from "@/types/mistake-book";

type MistakeInsightCardProps = {
  mistake: MistakeItem;
};

export function MistakeInsightCard({ mistake }: MistakeInsightCardProps) {
  const hasFormula = Boolean(mistake.insightFormula.trim());

  return (
    <article className="flex h-full flex-col rounded-[14px] bg-white px-4 py-4 shadow-soft sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <h2 className="text-[0.9375rem] font-semibold text-study-ink lg:text-base">
        {mistake.insightTitle}
      </h2>
      <div className="mt-2 text-sm leading-[1.45] text-study-muted-soft lg:text-[0.9375rem]">
        <MathText text={mistake.insightBody} />
      </div>
      {hasFormula ? (
        <div className="mt-auto pt-4 text-[0.9375rem] font-medium text-study-green lg:text-base">
          <MathText text={mistake.insightFormula} />
        </div>
      ) : null}
    </article>
  );
}
