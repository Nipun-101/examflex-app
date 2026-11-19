import type { AnalysisPathway, AnalysisPathwayBand } from "@/types/analysis";

export type PathwayBandResult = {
  band: AnalysisPathwayBand;
  progress01: number;
  message: string;
};

const DEFAULT_COMFORT_GAP_PP = 10;

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function resolveComfortPercent(
  minPercent: number,
  comfortPercent?: number | null
): number {
  const min = clampPercent(minPercent);
  if (
    comfortPercent !== undefined &&
    comfortPercent !== null &&
    Number.isFinite(comfortPercent)
  ) {
    return Math.max(min, clampPercent(comfortPercent));
  }
  return Math.min(100, min + DEFAULT_COMFORT_GAP_PP);
}

export function evaluatePathwayBand(
  userPercent: number | null,
  minPercent: number,
  comfortPercent?: number | null
): PathwayBandResult {
  const min = clampPercent(minPercent);
  const comfort = resolveComfortPercent(min, comfortPercent);

  if (userPercent === null || !Number.isFinite(userPercent)) {
    return {
      band: "below",
      progress01: 0,
      message: "Attempt full mocks to see how this path looks for you.",
    };
  }

  const avg = clampPercent(userPercent);
  const progress01 =
    min <= 0 ? (avg > 0 ? 1 : 0) : Math.min(1, avg / Math.max(min, 1e-6));

  if (avg < min) {
    return {
      band: "below",
      progress01,
      message: "A strong stretch — keep climbing toward this path.",
    };
  }

  if (avg < comfort) {
    return {
      band: "borderline",
      progress01,
      message: "Within reach — one more push would make this steadier.",
    };
  }

  return {
    band: "comfortable",
    progress01: 1,
    message: "Looking solid for this path on recent full-mock form.",
  };
}

/** Recompute pathway cards when the student edits the what-if score percent. */
export function remapPathwaysForPercent(
  pathways: readonly AnalysisPathway[],
  userPercent: number | null
): AnalysisPathway[] {
  return pathways.map((pathway) => {
    const band = evaluatePathwayBand(
      userPercent,
      pathway.minPercent,
      pathway.comfortPercent
    );
    return {
      ...pathway,
      userPercent,
      progress01: band.progress01,
      band: band.band,
      message: band.message,
    };
  });
}
