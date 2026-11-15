import { describe, expect, it } from "vitest";
import {
  clampAnalysisScore,
  formatAnalysisScore,
} from "@/lib/analysis/format-score";

describe("formatAnalysisScore", () => {
  it("formats score pairs", () => {
    expect(formatAnalysisScore(548, 720)).toBe("548 / 720");
    expect(formatAnalysisScore(-3, 720)).toBe("0 / 720");
  });
});

describe("clampAnalysisScore", () => {
  it("keeps scores inside the mock range", () => {
    expect(clampAnalysisScore(800, 720)).toBe(720);
    expect(clampAnalysisScore(-4, 720)).toBe(0);
    expect(clampAnalysisScore(501.9, 720)).toBe(501);
  });
});
