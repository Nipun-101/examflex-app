type EquationProgressProps = {
  chapterLabel: string;
  current: number;
  total: number;
  percent: number;
};

export function EquationProgress({
  chapterLabel,
  current,
  total,
  percent,
}: EquationProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
          {chapterLabel}
        </p>
        <p className="text-xs text-study-muted-soft">
          {current} of {total} equations
        </p>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-sm bg-study-divider"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Progress through ${chapterLabel}`}
      >
        <div
          className="h-full rounded-sm bg-study-green transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
