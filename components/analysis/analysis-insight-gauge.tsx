const CX = 100;
const CY = 98;
const R = 78;

/** Point on the semicircle: ratio 0 = left end, 1 = right end. */
function pointAt(ratio: number, radius: number) {
  const rad = ((180 - ratio * 180) * Math.PI) / 180;
  return { x: CX + Math.cos(rad) * radius, y: CY - Math.sin(rad) * radius };
}

function arcPath(from: number, to: number, radius = R): string {
  const a = pointAt(from, radius);
  const b = pointAt(to, radius);
  const large = to - from > 0.5 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y}`;
}

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export type GaugeSegment = {
  from: number;
  to: number;
  className: string;
};

export type GaugeTick = {
  ratio: number;
  label?: string;
  /** Long tick drawn across the track (milestones) vs short marker. */
  long?: boolean;
};

type AnalysisInsightGaugeProps = {
  /** Needle position 0-1; omit for the segmented (no needle) variant. */
  needle?: number;
  /** Solid highlight from 0 to this ratio, drawn under the needle. */
  fillTo?: number;
  fillClassName?: string;
  /** Solid coloured stretches (segmented variant). */
  segments?: readonly GaugeSegment[];
  /** Dense hairline ticks instead of a dotted track. */
  denseTicks?: boolean;
  ticks?: readonly GaugeTick[];
  startLabel: string;
  endLabel: string;
  ariaLabel: string;
  className?: string;
};

const DENSE_COUNT = 72;

export function AnalysisInsightGauge({
  needle,
  fillTo,
  fillClassName = "text-study-lime",
  segments = [],
  denseTicks = false,
  ticks = [],
  startLabel,
  endLabel,
  ariaLabel,
  className = "",
}: AnalysisInsightGaugeProps) {
  const needleRatio = needle === undefined ? null : clamp01(needle);
  const tip = needleRatio === null ? null : pointAt(needleRatio, R - 8);

  return (
    <div
      className={`relative w-full max-w-[16rem] shrink-0 ${className}`.trim()}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 200 118" className="h-auto w-full overflow-visible" aria-hidden>
        {denseTicks ? (
          Array.from({ length: DENSE_COUNT + 1 }, (_, i) => {
            const ratio = i / DENSE_COUNT;
            const a = pointAt(ratio, R - 5);
            const b = pointAt(ratio, R + 3);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-study-on-dark/45"
              />
            );
          })
        ) : (
          <path
            d={arcPath(0, 1)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="2.5 4.5"
            className="text-study-on-dark/65"
          />
        )}

        {fillTo !== undefined && clamp01(fillTo) > 0 ? (
          <path
            d={arcPath(0, clamp01(fillTo))}
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            className={fillClassName}
          />
        ) : null}

        {segments.map((segment, index) =>
          segment.to > segment.from ? (
            <path
              key={index}
              d={arcPath(clamp01(segment.from), clamp01(segment.to))}
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              className={segment.className}
            />
          ) : null
        )}

        {ticks.map((tick) => {
          const ratio = clamp01(tick.ratio);
          const inner = pointAt(ratio, R - (tick.long ? 9 : 6));
          const outer = pointAt(ratio, R + (tick.long ? 9 : 6));
          const text = pointAt(ratio, R + 17);
          return (
            <g key={`${tick.ratio}-${tick.label ?? ""}`}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="text-study-on-dark/80"
              />
              {tick.label ? (
                <text
                  x={text.x}
                  y={text.y}
                  textAnchor={ratio < 0.5 ? "end" : "start"}
                  className="fill-study-lime text-[7px] font-semibold"
                >
                  {tick.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {tip ? (
          <>
            <line
              x1={CX}
              y1={CY}
              x2={tip.x}
              y2={tip.y}
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              className="text-study-lime"
            />
            <circle cx={tip.x} cy={tip.y} r="5" className="fill-study-lime" />
          </>
        ) : null}
        <circle cx={CX} cy={CY} r="3" className="fill-study-lime" />
      </svg>
      <div className="pointer-events-none absolute inset-x-[0.65rem] bottom-0 flex justify-between text-[0.625rem] font-medium text-study-on-dark">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}
