export function formatAnalysisScore(score: number, maxScore: number): string {
  const safeScore = Math.max(0, Math.floor(score));
  const safeMax = Math.max(1, Math.floor(maxScore));
  return `${safeScore} / ${safeMax}`;
}

export function clampAnalysisScore(score: number, maxScore: number): number {
  const safeMax = Math.max(1, Math.floor(maxScore));
  return Math.min(safeMax, Math.max(0, Math.floor(score)));
}
