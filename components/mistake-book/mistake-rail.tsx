import { StudyButton } from "@/components/study/study-button";
import type { MistakeItem } from "@/types/mistake-book";

type MistakeRailProps = {
  mistakes: readonly MistakeItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function MistakeRail({
  mistakes,
  activeIndex,
  onSelect,
}: MistakeRailProps) {
  if (mistakes.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block">
      <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
        In this review
      </p>
      <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
        {mistakes.map((mistake, index) => {
          const active = index === activeIndex;

          return (
            <li key={mistake.id}>
              <StudyButton
                variant={active ? "railActive" : "rail"}
                onClick={() => onSelect(index)}
                className="flex w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left"
              >
                <span className="mt-0.5 w-8 shrink-0 text-xs font-semibold tabular-nums">
                  {mistake.questionNumber}
                </span>
                <span className="text-sm font-medium leading-snug">
                  {mistake.prompt}
                </span>
              </StudyButton>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
