import { StudyButton } from "@/components/study/study-button";
import type {
  MistakeTripOption,
  MistakeTripReason,
} from "@/types/mistake-book";

type MistakeTripTagsProps = {
  prompt: string;
  options: readonly MistakeTripOption[];
  value: MistakeTripReason;
  onChange: (reason: MistakeTripReason) => void;
};

export function MistakeTripTags({
  prompt,
  options,
  value,
  onChange,
}: MistakeTripTagsProps) {
  return (
    <div>
      <p className="text-base font-semibold text-study-ink">{prompt}</p>
      <div
        role="group"
        aria-label={prompt}
        className="mt-3 grid grid-cols-3 gap-2 sm:gap-3"
      >
        {options.map((option) => {
          const active = option.id === value;

          return (
            <StudyButton
              key={option.id}
              variant={active ? "ink" : "surface"}
              aria-pressed={active}
              className="inline-flex h-10 w-full items-center justify-center rounded-[10px] px-2 text-[0.8125rem] font-medium"
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </StudyButton>
          );
        })}
      </div>
    </div>
  );
}
