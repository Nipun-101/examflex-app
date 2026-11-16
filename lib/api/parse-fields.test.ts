import { describe, expect, it } from "vitest";
import {
  optionalField,
  parseList,
  readBoolean,
  readNumber,
  readNumberOrNull,
  readString,
  readStringList,
  readStringOrNull,
} from "@/lib/api/parse-fields";

describe("primitive readers", () => {
  it("reads strings", () => {
    expect(readString("a")).toBe("a");
    expect(readString(1)).toBeUndefined();
    expect(readStringOrNull("a")).toBe("a");
    expect(readStringOrNull(undefined)).toBeNull();
    expect(readStringOrNull(1)).toBeNull();
  });

  it("reads finite numbers only", () => {
    expect(readNumber(3)).toBe(3);
    expect(readNumber(0)).toBe(0);
    expect(readNumber(Number.NaN)).toBeUndefined();
    expect(readNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(readNumber("3")).toBeUndefined();
    expect(readNumberOrNull(3)).toBe(3);
    expect(readNumberOrNull(null)).toBeNull();
    expect(readNumberOrNull("3")).toBeNull();
  });

  it("reads booleans", () => {
    expect(readBoolean(false)).toBe(false);
    expect(readBoolean("true")).toBeUndefined();
  });
});

describe("parseList", () => {
  const parseNumber = (item: unknown): number | null =>
    typeof item === "number" ? item : null;

  it("returns null for non-arrays", () => {
    expect(parseList({}, parseNumber)).toBeNull();
    expect(parseList(undefined, parseNumber)).toBeNull();
  });

  it("drops rejected items", () => {
    expect(parseList([1, "x", 2, null], parseNumber)).toEqual([1, 2]);
    expect(parseList([], parseNumber)).toEqual([]);
  });
});

describe("readStringList", () => {
  it("filters to strings and rejects non-arrays", () => {
    expect(readStringList(["a", 1, "b"])).toEqual(["a", "b"]);
    expect(readStringList("a")).toBeUndefined();
  });
});

describe("optionalField", () => {
  it("omits undefined values and keeps defined ones", () => {
    expect(optionalField("a", undefined)).toEqual({});
    expect("a" in optionalField("a", undefined)).toBe(false);
    expect(optionalField("a", 0)).toEqual({ a: 0 });
    expect(optionalField("a", null)).toEqual({ a: null });
  });
});
