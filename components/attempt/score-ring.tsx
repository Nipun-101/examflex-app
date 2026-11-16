import { formatScore } from "@/lib/mocks/attempt-format";
import { scorePercentage, scoreRingColor } from "@/lib/mocks/performance-bands";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ScoreRingProps = {
  earned: number;
  max: number;
};

export function ScoreRing({ earned, max }: ScoreRingProps) {
  const percentage = scorePercentage(earned, max);
  const isFull = max > 0 && earned + 1e-6 >= max;
  const color = scoreRingColor(isFull ? 100 : percentage);
  const dashOffset = isFull ? 0 : CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div
      role="img"
      aria-label={`Score ${formatScore(earned)} out of ${formatScore(max)}`}
      className="relative shrink-0"
    >
      <svg className="h-24 w-24 sm:h-28 sm:w-28" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="#dee2d9"
          strokeWidth="8"
        />
        {percentage > 0 ? (
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap={isFull ? "butt" : "round"}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            data-testid="score-ring-arc"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-study-ink sm:text-3xl">
          {formatScore(earned)}
        </span>
        <span className="text-xs text-study-muted-soft">of {formatScore(max)}</span>
      </div>
    </div>
  );
}
