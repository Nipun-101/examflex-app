/** Subtitle under a paper-type chip on the hub exam card. */
export function paperCountLabel(count: number): string {
  if (count <= 0) return "No papers yet";
  if (count === 1) return "1 paper ready";
  return `${count} papers ready`;
}
