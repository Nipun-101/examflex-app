import { describe, expect, it } from "vitest";
import { buildScoreBars } from "@/lib/today/score-bars";

describe("buildScoreBars", () => {
  it("amplifies relative differences and flags the latest attempt", () => {
    const bars = buildScoreBars(
      [
        { id: "a", label: "Mock 10", score: 512 },
        { id: "b", label: "Mock 11", score: 530 },
        { id: "c", label: "Mock 12", score: 548 },
      ],
      720
    );

    expect(bars[0]?.heightPercent).toBe(40);
    expect(bars[1]?.heightPercent).toBe(70);
    expect(bars[2]?.heightPercent).toBe(100);
    expect(bars[2]?.isLatest).toBe(true);
    expect(bars[0]?.isLatest).toBe(false);
  });

  it("returns an empty list for no attempts", () => {
    expect(buildScoreBars([], 720)).toEqual([]);
  });

  it("keeps equal scores at full visual height", () => {
    const bars = buildScoreBars(
      [
        { id: "a", label: "A", score: 500 },
        { id: "b", label: "B", score: 500 },
      ],
      720
    );

    expect(bars[0]?.heightPercent).toBe(40);
    expect(bars[1]?.heightPercent).toBe(40);
  });

  it("clamps scores against maxScore", () => {
    const bars = buildScoreBars(
      [
        { id: "low", label: "Low", score: -10 },
        { id: "high", label: "High", score: 999 },
      ],
      720
    );

    expect(bars[0]?.heightPercent).toBe(40);
    expect(bars[1]?.heightPercent).toBe(100);
  });

  it("falls back to attempt scores when maxScore is non-positive", () => {
    const bars = buildScoreBars(
      [
        { id: "a", label: "A", score: 100 },
        { id: "b", label: "B", score: 200 },
      ],
      0
    );

    expect(bars[0]?.heightPercent).toBe(40);
    expect(bars[1]?.heightPercent).toBe(100);
  });
});

