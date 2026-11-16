/** Browser detection helper — mockable in unit tests. */
export function getWindow(): Window | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window;
}
