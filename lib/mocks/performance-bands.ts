import type { AttemptLanguage, AttemptPerformanceBand } from "@/types/attempt";

export type PerformanceBandKey =
  | "needs_improvement"
  | "good"
  | "very_good"
  | "excellent";

interface KnownBand {
  key: PerformanceBandKey;
  minPercent: number;
}

export const DEFAULT_PERFORMANCE_BANDS: readonly KnownBand[] = [
  { key: "needs_improvement", minPercent: 0 },
  { key: "good", minPercent: 40 },
  { key: "very_good", minPercent: 70 },
  { key: "excellent", minPercent: 85 },
];

const LOWEST_BAND: KnownBand = { key: "needs_improvement", minPercent: 0 };

interface BandCopy {
  en: string;
  ml: string;
  className: string;
  emoji: string;
}

const COPY: Record<PerformanceBandKey, BandCopy> = {
  needs_improvement: {
    en: "Needs more improvement",
    ml: "കൂടുതൽ മെച്ചപ്പെടുത്താം",
    className: "bg-study-peach text-study-peach-ink",
    emoji: "😊",
  },
  good: {
    en: "Good",
    ml: "നല്ലത്",
    className: "bg-study-mint text-study-green",
    emoji: "😄",
  },
  very_good: {
    en: "Very good",
    ml: "വളരെ നല്ലത്",
    className: "bg-study-lilac text-study-ink",
    emoji: "😁",
  },
  excellent: {
    en: "Excellent",
    ml: "മികച്ചത്",
    className: "bg-study-lime text-study-ink",
    emoji: "🤩",
  },
};

function isBandKey(key: string): key is PerformanceBandKey {
  return key in COPY;
}

export interface PerformanceMessage {
  label: string;
  className: string;
  emoji: string;
}

/** Pick the highest band whose threshold the score share reaches. */
export function resolvePerformanceMessage(
  score: number,
  totalScore: number,
  bands: readonly AttemptPerformanceBand[] | undefined,
  language: AttemptLanguage
): PerformanceMessage {
  const percent = totalScore > 0 ? (score / totalScore) * 100 : 0;
  const known: KnownBand[] = [];
  for (const band of bands ?? []) {
    if (isBandKey(band.key) && Number.isFinite(band.minPercent)) {
      known.push({ key: band.key, minPercent: band.minPercent });
    }
  }
  const usable = known.length > 0 ? known : DEFAULT_PERFORMANCE_BANDS;
  const chosen = [...usable]
    .sort((a, b) => a.minPercent - b.minPercent)
    .reduce<KnownBand>(
      (best, band) => (percent >= band.minPercent ? band : best),
      LOWEST_BAND
    );
  const copy = COPY[chosen.key];
  return {
    label: language === "ml" ? copy.ml : copy.en,
    className: copy.className,
    emoji: copy.emoji,
  };
}

/** Ring stroke colour by score share: 80%+ (or full marks) is the brand green. */
export function scoreRingColor(percentage: number): string {
  if (percentage >= 80) return "#176b56";
  if (percentage >= 60) return "#4a9a7e";
  if (percentage >= 40) return "#c9a227";
  if (percentage >= 20) return "#d9803f";
  return "#c4553f";
}

export function scorePercentage(earned: number, max: number): number {
  if (!Number.isFinite(earned) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (earned / max) * 100));
}
