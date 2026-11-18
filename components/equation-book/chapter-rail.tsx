import { StudyButton } from "@/components/study/study-button";
import type { EquationItem } from "@/types/equation-book";

type ChapterRailProps = {
  cards: readonly EquationItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function ChapterRail({
  cards,
  activeIndex,
  onSelect,
}: ChapterRailProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block">
      <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
        In this chapter
      </p>
      <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
        {cards.map((card, index) => {
          const active = index === activeIndex;

          return (
            <li key={card.id}>
              <StudyButton
                variant={active ? "railActive" : "rail"}
                onClick={() => onSelect(index)}
                className="flex w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left"
              >
                <span className="mt-0.5 w-5 shrink-0 text-xs font-semibold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium leading-snug">
                  {card.title}
                </span>
              </StudyButton>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
