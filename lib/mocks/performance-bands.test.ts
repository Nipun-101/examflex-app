import { describe, expect, it } from "vitest";
import {
  resolvePerformanceMessage,
  scorePercentage,
  scoreRingColor,
} from "@/lib/mocks/performance-bands";

describe("resolvePerformanceMessage", () => {
  it("uses default bands", () => {
    expect(resolvePerformanceMessage(10, 100, undefined, "en").label).toBe(
      "Needs more improvement"
    );
    expect(resolvePerformanceMessage(45, 100, undefined, "en").label).toBe(
      "Good"
    );
    expect(resolvePerformanceMessage(75, 100, undefined, "en").label).toBe(
      "Very good"
    );
    expect(resolvePerformanceMessage(90, 100, undefined, "en").label).toBe(
      "Excellent"
    );
  });

  it("localises to Malayalam", () => {
    expect(resolvePerformanceMessage(90, 100, undefined, "ml").label).toBe(
      "മികച്ചത്"
    );
  });

  it("honours exam-specific bands and ignores unknown keys", () => {
    const bands = [
      { key: "excellent", minPercent: 50 },
      { key: "mystery", minPercent: 0 },
      { key: "good", minPercent: Number.NaN },
    ];
    expect(resolvePerformanceMessage(60, 100, bands, "en").label).toBe(
      "Excellent"
    );
    // Below every threshold: lowest band wins.
    expect(resolvePerformanceMessage(10, 100, bands, "en").label).toBe(
      "Needs more improvement"
    );
  });

  it("handles a zero maximum", () => {
    const message = resolvePerformanceMessage(0, 0, undefined, "en");
    expect(message.label).toBe("Needs more improvement");
    expect(message.emoji).not.toBe("");
    expect(message.className).toContain("bg-study-");
  });
});

describe("scorePercentage", () => {
  it("clamps and guards invalid input", () => {
    expect(scorePercentage(50, 200)).toBe(25);
    expect(scorePercentage(300, 200)).toBe(100);
    expect(scorePercentage(-5, 200)).toBe(0);
    expect(scorePercentage(5, 0)).toBe(0);
    expect(scorePercentage(Number.NaN, 10)).toBe(0);
  });
});

describe("scoreRingColor", () => {
  it("steps through five bands", () => {
    const colors = [90, 65, 45, 25, 5].map(scoreRingColor);
    expect(new Set(colors).size).toBe(5);
  });
});
