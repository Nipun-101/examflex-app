import { StudyButton } from "@/components/study/study-button";

type MistakePagerProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function MistakePager({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  className = "",
}: MistakePagerProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`.trim()}>
      <StudyButton
        variant="surface"
        disabled={!canGoPrevious}
        className="inline-flex h-11 items-center justify-center rounded-[10px] text-[0.8125rem] font-medium whitespace-pre"
        onClick={onPrevious}
      >
        ←  Previous
      </StudyButton>
      <StudyButton
        variant="surface"
        disabled={!canGoNext}
        className="inline-flex h-11 items-center justify-center rounded-[10px] text-[0.8125rem] font-medium whitespace-pre"
        onClick={onNext}
      >
        Next  →
      </StudyButton>
    </div>
  );
}

type MistakeRemoveActionProps = {
  understoodLabel: string;
  understoodHint: string;
  onUnderstood: () => void;
  className?: string;
};

export function MistakeRemoveAction({
  understoodLabel,
  understoodHint,
  onUnderstood,
  className = "",
}: MistakeRemoveActionProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <StudyButton
        variant="solid"
        className="inline-flex h-12 w-full items-center justify-center rounded-[10px] px-4 text-[0.8125rem] font-medium"
        onClick={onUnderstood}
      >
        {understoodLabel}
      </StudyButton>
      <p className="text-center text-xs text-study-muted-soft lg:text-left">
        {understoodHint}
      </p>
    </div>
  );
}
