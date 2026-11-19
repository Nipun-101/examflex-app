type AnalysisScoreGaugeProps = {
  score: number | null;
  maxScore: number;
  className?: string;
};

/** Semicircle gauge for the Analysis performance card (empty needle at 0). */
export function AnalysisScoreGauge({
  score,
  maxScore,
  className = "",
}: AnalysisScoreGaugeProps) {
  const safeMax = Math.max(1, maxScore);
  const ratio =
    score === null || !Number.isFinite(score)
      ? 0
      : Math.min(1, Math.max(0, score / safeMax));
  // Needle angle: 180° (left / empty) → 0° (right / max)
  const angleDeg = 180 - ratio * 180;
  const rad = (angleDeg * Math.PI) / 180;
  const cx = 100;
  const cy = 98;
  const r = 78;
  const tipR = r - 8;
  const needleX = cx + Math.cos(rad) * tipR;
  const needleY = cy - Math.sin(rad) * tipR;

  return (
    <div
      className={`relative w-full max-w-[12.5rem] shrink-0 ${className}`.trim()}
      role="img"
      aria-label={
        score === null
          ? `Score gauge empty, out of ${safeMax}`
          : `Score ${score} of ${safeMax}`
      }
    >
      <svg viewBox="0 0 200 118" className="h-auto w-full" aria-hidden>
        <path
          d="M 22 98 A 78 78 0 0 1 178 98"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="2.5 4.5"
          className="text-study-on-dark/65"
        />
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          className="text-study-lime"
        />
        <circle cx={needleX} cy={needleY} r="5" className="fill-study-lime" />
        <circle cx={cx} cy={cy} r="3" className="fill-study-on-dark/70" />
      </svg>
      <div className="pointer-events-none absolute inset-x-[0.65rem] bottom-0 flex justify-between text-[0.625rem] font-medium text-study-on-dark">
        <span>0</span>
        <span>{safeMax}</span>
      </div>
    </div>
  );
}
