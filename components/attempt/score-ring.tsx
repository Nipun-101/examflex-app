import { formatScore } from "@/lib/mocks/attempt-format";
import { scorePercentage, scoreRingColor } from "@/lib/mocks/performance-bands";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ScoreRingProps = {
  earned: number;
  max: number;
  className?: string;
  /** Override the default large svg sizing (e.g. compact card ring). */
  svgClassName?: string;
  valueClassName?: string;
  ofClassName?: string;
  /** Dark summary card: lime arc on a muted track with light type. */
  tone?: "default" | "onDark";
  /** Force the arc stroke (e.g. always lime on the dark summary). */
  arcColor?: string;
  trackColor?: string;
};

export function ScoreRing({
  earned,
  max,
  className = "",
  svgClassName = "h-24 w-24 sm:h-28 sm:w-28",
  valueClassName,
  ofClassName,
  tone = "default",
  arcColor,
  trackColor,
}: ScoreRingProps) {
  const percentage = scorePercentage(earned, max);
  const isFull = max > 0 && earned + 1e-6 >= max;
  const color =
    arcColor ??
    (tone === "onDark"
      ? "#daec9b"
      : scoreRingColor(isFull ? 100 : percentage));
  const track = trackColor ?? (tone === "onDark" ? "#2f564c" : "#dee2d9");
  const dashOffset = isFull ? 0 : CIRCUMFERENCE * (1 - percentage / 100);
  const resolvedValueClass =
    valueClassName ??
    (tone === "onDark"
      ? "font-display text-2xl font-bold text-white sm:text-3xl"
      : "font-display text-2xl font-bold text-study-ink sm:text-3xl");
  const resolvedOfClass =
    ofClassName ??
    (tone === "onDark"
      ? "text-xs text-study-on-dark"
      : "text-xs text-study-muted-soft");

  return (
    <div
      role="img"
      aria-label={`Score ${formatScore(earned)} out of ${formatScore(max)}`}
      className={`relative shrink-0 ${className}`.trim()}
    >
      <svg className={svgClassName} viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={track}
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
        <span className={resolvedValueClass}>{formatScore(earned)}</span>
        <span className={resolvedOfClass}>of {formatScore(max)}</span>
      </div>
    </div>
  );
}
