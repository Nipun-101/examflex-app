"use client";

import { StudyButton } from "@/components/study/study-button";
import { mistakeRailLabel } from "@/lib/mistake-book/rail-label";
import type { MistakeItem } from "@/types/mistake-book";

type MistakeRailProps = {
  mistakes: readonly MistakeItem[];
  activeIndex: number;
  mockLabel: string;
  onSelect: (index: number) => void;
};

export function MistakeRail({
  mistakes,
  activeIndex,
  mockLabel,
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
          const label = mistakeRailLabel(mistake, mockLabel);

          return (
            <li key={mistake.id}>
              <StudyButton
                variant={active ? "railActive" : "rail"}
                onClick={() => onSelect(index)}
                className="w-full truncate rounded-[10px] px-3 py-2.5 text-left text-sm font-medium"
                aria-label={label}
              >
                {label}
              </StudyButton>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
