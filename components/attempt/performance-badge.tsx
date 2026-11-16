import { resolvePerformanceMessage } from "@/lib/mocks/performance-bands";
import type { AttemptLanguage, AttemptPerformanceBand } from "@/types/attempt";

type PerformanceBadgeProps = {
  score: number;
  totalScore: number;
  bands: readonly AttemptPerformanceBand[] | undefined;
  language: AttemptLanguage;
};

export function PerformanceBadge({
  score,
  totalScore,
  bands,
  language,
}: PerformanceBadgeProps) {
  const message = resolvePerformanceMessage(score, totalScore, bands, language);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${message.className}`}
    >
      <span aria-hidden>{message.emoji}</span>
      {message.label}
    </span>
  );
}
