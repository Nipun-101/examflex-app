const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

/** True for a canonical 24-char hex Mongo ObjectId string. */
export function isMongoObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID_RE.test(value);
}

/** Normalize Next.js `useParams()` dynamic segments (`string | string[]`). */
export function normalizeRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === "string" && entry.trim());
    return typeof first === "string" ? first.trim() : undefined;
  }
  return undefined;
}
