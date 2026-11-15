type MistakeProgressProps = {
  label: string;
  current: number;
  total: number;
  percent: number;
};

export function MistakeProgress({
  label,
  current,
  total,
  percent,
}: MistakeProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
          {label}
        </p>
        <p className="text-xs text-study-muted-soft">
          {current} of {total} mistakes
        </p>
      </div>
      <div
        className="h-[5px] w-full overflow-hidden rounded-[3px] bg-study-divider"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Review progress: ${current} of ${total}`}
      >
        <div
          className="h-full rounded-[3px] bg-study-green transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
