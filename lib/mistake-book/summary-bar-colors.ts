/**
 * High-contrast segment colors for the dark "In your book" summary bar.
 * Assigned by position — never by subject name — so related labels
 * (e.g. Physics vs Physics Core) stay visually distinct.
 */
export const MISTAKE_SUMMARY_BAR_COLORS = [
  "#daec9b", // lime
  "#f2b07a", // peach
  "#cbbce8", // lilac
  "#6ec8d4", // teal
  "#f0a0b8", // rose
  "#8ec5f0", // sky
] as const;

/**
 * Color for the subject at `index` in the summary bar.
 * Cycles the palette if there are more subjects than swatches.
 */
export function mistakeSummaryBarColor(index: number): string {
  const palette = MISTAKE_SUMMARY_BAR_COLORS;
  const safeIndex =
    Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0;
  return palette[safeIndex % palette.length] ?? palette[0];
}
