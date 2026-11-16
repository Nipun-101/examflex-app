/** Small, typed field readers for parsing `unknown` API payloads. */

export function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/** Non-string values (including undefined) become `null`. */
export function readStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Non-finite or non-number values (including undefined) become `null`. */
export function readNumberOrNull(value: unknown): number | null {
  return readNumber(value) ?? null;
}

/**
 * Parse an array, dropping items the parser rejects.
 * Returns `null` when the value is not an array.
 */
export function parseList<T>(
  value: unknown,
  parseItem: (item: unknown) => T | null
): T[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .map((item: unknown) => parseItem(item))
    .filter((item): item is T => item !== null);
}

/** Keep only string entries; `undefined` when the value is not an array. */
export function readStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * Spread helper for optional properties under `exactOptionalPropertyTypes`:
 * `{ ...optionalField("note", readString(v.note)) }` adds the key only when
 * the value is defined.
 */
export function optionalField<K extends string, V>(
  key: K,
  value: V | undefined
): { [P in K]?: V } {
  if (value === undefined) return {};
  return { [key]: value } as { [P in K]?: V };
}
