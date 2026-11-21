import { Clock, TrendingUp } from "lucide-react";
import { ScoreRing } from "@/components/attempt/score-ring";

type CompactSummaryBase = {
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  accuracy: string;
  title: string;
  /** e.g. "NEET UG" */
  subtitle: string;
};

const SMALL_RING_COLORS = { arcColor: "#176b56", trackColor: "#e3eedc" };

/**
 * Phone: slim bar pinned to the top once the full result card has scrolled
 * away. Shows the score ring, the paper, and the correct/wrong/skipped counts.
 */
export function ResultsSummaryBar({
  correct,
  wrong,
  skipped,
  total,
  accuracy,
  title,
  subtitle,
}: CompactSummaryBase) {
  return (
    <div
      role="region"
      aria-label="Score summary bar"
      className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-study-divider bg-white px-4 shadow-soft lg:hidden"
    >
      <ScoreRing
        earned={correct}
        max={total}
        svgClassName="size-10"
        valueClassName="font-display text-[13px] font-extrabold text-study-ink"
        ofClassName="hidden"
        {...SMALL_RING_COLORS}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-study-ink">{title}</p>
        <p className="truncate text-[11px] font-medium text-study-muted-soft">
          {subtitle} · {correct} of {total} · {accuracy}%
        </p>
      </div>
      <dl className="flex shrink-0 gap-1">
        <div className="min-w-[34px] rounded-[12px] bg-[#d5e8cf] py-[5px] text-center text-xs font-bold text-study-green">
          <dt className="sr-only">Correct</dt>
          <dd>{correct}</dd>
        </div>
        <div className="min-w-[34px] rounded-[12px] bg-[#f4d6cb] py-[5px] text-center text-xs font-bold text-[#8a3f2a]">
          <dt className="sr-only">Wrong</dt>
          <dd>{wrong}</dd>
        </div>
        <div className="min-w-[34px] rounded-[12px] bg-[#e9e3d6] py-[5px] text-center text-xs font-bold text-study-muted-soft">
          <dt className="sr-only">Skipped</dt>
          <dd>{skipped}</dd>
        </div>
      </dl>
    </div>
  );
}

type MiniSummaryProps = CompactSummaryBase & {
  timeLabel: string;
};

/** Desktop: replaces the result card at the top of the pinned map card. */
export function ResultsMiniSummary({
  correct,
  total,
  accuracy,
  title,
  subtitle,
  timeLabel,
}: MiniSummaryProps) {
  return (
    <div className="flex items-center gap-3 border-b border-study-divider pb-3">
      <ScoreRing
        earned={correct}
        max={total}
        svgClassName="size-12"
        valueClassName="font-display text-base font-extrabold text-study-ink"
        ofClassName="hidden"
        {...SMALL_RING_COLORS}
      />
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-study-ink">{title}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-study-muted-soft">
          {subtitle} · {correct} of {total}
        </p>
        <p className="mt-0.5 flex gap-2.5 text-xs font-medium text-study-muted-soft">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-3.5" strokeWidth={2.4} aria-hidden />
            {accuracy}% accuracy
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" strokeWidth={2.4} aria-hidden />
            {timeLabel}
          </span>
        </p>
      </div>
    </div>
  );
}
