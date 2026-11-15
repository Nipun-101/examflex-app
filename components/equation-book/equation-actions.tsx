import {
  StudyButton,
  StudyControlLink,
} from "@/components/study/study-button";

type EquationPagerProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function EquationPager({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  className = "",
}: EquationPagerProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`.trim()}>
      <StudyButton
        variant="surface"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        className="inline-flex h-11 items-center justify-center rounded-[10px] text-[0.8125rem] font-medium whitespace-pre lg:h-12"
      >
        ←  Previous
      </StudyButton>
      <StudyButton
        variant="surface"
        disabled={!canGoNext}
        onClick={onNext}
        className="inline-flex h-11 items-center justify-center rounded-[10px] text-[0.8125rem] font-medium whitespace-pre lg:h-12"
      >
        Next  →
      </StudyButton>
    </div>
  );
}

type EquationCtasProps = {
  mockLabel: string;
  mockHref: string;
  browseLabel: string;
  browseHref: string;
  className?: string;
};

export function EquationCtas({
  mockLabel,
  mockHref,
  browseLabel,
  browseHref,
  className = "",
}: EquationCtasProps) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`.trim()}>
      <StudyControlLink
        href={mockHref}
        variant="solid"
        className="inline-flex h-12 items-center justify-center rounded-[10px] px-4 text-center text-[0.8125rem] font-medium whitespace-pre lg:h-[3.25rem]"
      >
        {mockLabel}
      </StudyControlLink>

      <StudyControlLink
        href={browseHref}
        variant="outline"
        className="inline-flex h-[50px] items-center justify-center rounded-[12px] px-3.5 text-center text-[0.8125rem] font-medium whitespace-pre lg:justify-start"
      >
        {browseLabel}
      </StudyControlLink>
    </div>
  );
}

type EquationActionsProps = EquationPagerProps &
  EquationCtasProps & {
    className?: string;
  };

export function EquationActions({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  mockLabel,
  mockHref,
  browseLabel,
  browseHref,
  className = "",
}: EquationActionsProps) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`.trim()}>
      <EquationPager
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={onPrevious}
        onNext={onNext}
      />
      <EquationCtas
        mockLabel={mockLabel}
        mockHref={mockHref}
        browseLabel={browseLabel}
        browseHref={browseHref}
      />
    </div>
  );
}
