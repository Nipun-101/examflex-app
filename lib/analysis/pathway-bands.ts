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
