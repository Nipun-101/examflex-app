import type { MistakeItem } from "@/types/mistake-book";

type MistakeQuestionBlockProps = {
  mistake: MistakeItem;
};

export function MistakeQuestionBlock({ mistake }: MistakeQuestionBlockProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.6875rem] font-semibold tracking-wide whitespace-pre-wrap text-study-green uppercase">
          {`${mistake.questionNumber}  /  ${mistake.subjectLabel}`}
        </p>
        <p className="text-xs text-study-muted-soft">{mistake.examTimeLabel}</p>
      </div>
      <p className="mt-3 text-base font-medium leading-[1.45] text-study-ink sm:text-lg lg:text-[1.35rem] lg:leading-snug">
        {mistake.prompt}
      </p>
    </div>
  );
}
