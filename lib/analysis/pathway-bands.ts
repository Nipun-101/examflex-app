import type { AnalysisPathway } from "@/types/analysis";

/**
 * Presentation helpers for the pathway cards. The band, gap and message are
 * computed by the API from marks; nothing here re-derives them.
 */

export type PathwayBarGeometry = {
  /** Right edge of the bar in marks (never less than any plotted value). */
  scaleMax: number;
  /** Width of the "your marks" fill, 0-100. */
  fillPct: number;
  /** Position of the cut-off tick, 0-100. */
  cutoffPct: number;
  /** Width of the comfort zone that starts at the cut-off, 0-100. */
  comfortZonePct: number;
};

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Bar positions on a 0 -> exam-total scale (720 for NEET, 300 for JEE, ...).
 * The scale grows if a plotted value exceeds the stated total, so the tick and
 * fill can never fall off the track. Negative marks clamp the fill to 0.
 */
export function pathwayBarGeometry(input: {
  yourMarks: number;
  cutoffMarks: number;
  comfortMarks: number;
  maxMarks: number | null;
}): PathwayBarGeometry {
  const scaleMax = Math.max(
    input.maxMarks ?? 0,
    input.cutoffMarks,
    input.comfortMarks,
    input.yourMarks,
    1
  );
  const pct = (value: number) => clampPct((value / scaleMax) * 100);
  const cutoffPct = pct(input.cutoffMarks);
  return {
    scaleMax,
    fillPct: pct(input.yourMarks),
    cutoffPct,
    comfortZonePct: Math.max(0, pct(input.comfortMarks) - cutoffPct),
  };
}

/** 584 -> "584", 584.25 -> "584.3", -3 -> "-3". */
export function formatMarks(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** "Based on your last 8 full mocks" vs "Based on 5 of your last 10 full mocks". */
export function describePathwayBasis(
  pathway: Pick<AnalysisPathway, "attemptsConsidered" | "attemptsInWindow">
): string {
  const { attemptsConsidered: used, attemptsInWindow: window } = pathway;
  const mocks = (count: number) => (count === 1 ? "full mock" : "full mocks");
  if (used >= window || window <= 0) {
    return `Based on your last ${used} ${mocks(used)}`;
  }
  return `Based on ${used} of your last ${window} ${mocks(window)}`;
}

export const PATHWAY_BAND_LABEL: Record<AnalysisPathway["band"], string> = {
  below: "Below cut-off",
  borderline: "Within reach",
  comfortable: "Looking solid",
};

/**
 * Progress-bar colour stops keyed by marks / cut-off: deep red at 0, green at 1.
 * Real students sit low on this scale (roughly 5-30% of a cut-off), so the
 * stops are packed there on purpose: 11% and 15% of a cut-off land on visibly
 * different reds/oranges instead of the same red. Past the packed low end the
 * ramp stretches out to green at the cut-off.
 */
const PROGRESS_COLOR_STOPS: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
  [0, [200, 40, 45]],
  [0.1, [232, 100, 60]],
  [0.15, [240, 150, 50]],
  [0.2, [235, 190, 45]],
  [0.3, [190, 200, 60]],
  [0.5, [120, 185, 75]],
  [1, [23, 107, 86]],
];

/** Colour changes in steps of this ratio (5%), giving 21 distinct shades. */
const PROGRESS_STEP = 0.05;

/**
 * Fill colour for "how close is the student to the cut-off", from marks and the
 * course's own cut-off: 0 is red, 1 (or more) is the app green, with a slightly
 * different shade for every 5% in between. A cut-off of 0 or less counts as reached. Non-finite
 * input is treated as 0.
 */
export function pathwayProgressColor(yourMarks: number, cutoffMarks: number): string {
  const raw = cutoffMarks > 0 ? yourMarks / cutoffMarks : 1;
  const clamped = Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0;
  // Snap down to the 5% step (epsilon guards float error, e.g. 0.15 * 20).
  const ratio =
    Math.floor(clamped / PROGRESS_STEP + 1e-9) * PROGRESS_STEP;
  const upperIndex = PROGRESS_COLOR_STOPS.findIndex(([at]) => ratio <= at);
  const upper = PROGRESS_COLOR_STOPS[Math.max(1, upperIndex)] as (typeof PROGRESS_COLOR_STOPS)[number];
  const lower = PROGRESS_COLOR_STOPS[Math.max(0, upperIndex - 1)] as (typeof PROGRESS_COLOR_STOPS)[number];
  const span = upper[0] - lower[0];
  const t = span === 0 ? 0 : (ratio - lower[0]) / span;
  const [r, g, b] = lower[1].map((from, i) =>
    Math.round(from + ((upper[1][i] as number) - from) * t)
  );
  return `rgb(${r}, ${g}, ${b})`;
}
