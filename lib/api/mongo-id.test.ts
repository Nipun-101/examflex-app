import { describe, expect, it } from "vitest";
import { isMongoObjectId, normalizeRouteParam } from "@/lib/api/mongo-id";

describe("mongo-id helpers", () => {
  it("accepts only 24-char hex ids", () => {
    expect(isMongoObjectId("6ac1335993fbfb809bc99def")).toBe(true);
    expect(isMongoObjectId("6AC1335993FBFB809BC99DEF")).toBe(true);
    expect(isMongoObjectId("undefined")).toBe(false);
    expect(isMongoObjectId("[id]")).toBe(false);
    expect(isMongoObjectId("not-an-id")).toBe(false);
    expect(isMongoObjectId("")).toBe(false);
    expect(isMongoObjectId(null)).toBe(false);
  });

  it("normalizes route params", () => {
    expect(normalizeRouteParam("abc")).toBe("abc");
    expect(normalizeRouteParam(["abc", "def"])).toBe("abc");
    expect(normalizeRouteParam(["", "def"])).toBe("def");
    expect(normalizeRouteParam(undefined)).toBeUndefined();
    expect(normalizeRouteParam("  ")).toBeUndefined();
    expect(normalizeRouteParam([])).toBeUndefined();
  });
});
