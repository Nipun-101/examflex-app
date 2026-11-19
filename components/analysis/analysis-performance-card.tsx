import { AnalysisScoreGauge } from "@/components/analysis/analysis-score-gauge";
import { formatAnalysisScore } from "@/lib/analysis/format-score";

type AnalysisPerformanceCardProps = {
  label: string;
  score: number | null;
  maxScore: number;
  scoreHint: string;
};

export function AnalysisPerformanceCard({
  label,
  score,
  maxScore,
  scoreHint,
}: AnalysisPerformanceCardProps) {
  const empty = score === null;

  return (
    <section className="rounded-[18px] bg-study-ink px-4 py-5 text-white sm:px-5 sm:py-6 lg:px-6 lg:py-7">
      <p className="text-[0.625rem] font-semibold tracking-wide text-study-lime uppercase">
        {label}
      </p>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[2rem] font-semibold leading-none tracking-tight text-white lg:text-[2.75rem]">
            {empty ? `— / ${maxScore}` : formatAnalysisScore(score, maxScore)}
          </p>

          <p className="mt-4 max-w-md text-[0.6875rem] leading-[1.45] text-study-on-dark sm:text-xs">
            {scoreHint}
          </p>
        </div>

        <AnalysisScoreGauge
          score={empty ? null : score}
          maxScore={maxScore}
          className="mx-auto sm:mx-0"
        />
      </div>
    </section>
  );
}
