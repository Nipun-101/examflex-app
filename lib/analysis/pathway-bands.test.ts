import { describe, expect, it } from "vitest";
import {
  PATHWAY_BAND_LABEL,
  describePathwayBasis,
  formatMarks,
  pathwayBarGeometry,
} from "@/lib/analysis/pathway-bands";

describe("pathwayBarGeometry", () => {
  it("places the fill, cut-off tick and comfort zone on a 0 -> total scale", () => {
    const g = pathwayBarGeometry({
      yourMarks: 360,
      cutoffMarks: 540,
      comfortMarks: 567,
      maxMarks: 720,
    });
    expect(g.scaleMax).toBe(720);
    expect(g.fillPct).toBeCloseTo(50, 6);
    expect(g.cutoffPct).toBeCloseTo(75, 6);
    expect(g.comfortZonePct).toBeCloseTo(3.75, 6);
  });

  it("works on a 300-mark exam (JEE) without any hard-coded total", () => {
    const g = pathwayBarGeometry({
      yourMarks: 150,
      cutoffMarks: 250,
      comfortMarks: 262.5,
      maxMarks: 300,
    });
    expect(g.scaleMax).toBe(300);
    expect(g.fillPct).toBeCloseTo(50, 6);
    expect(g.cutoffPct).toBeCloseTo(83.333, 2);
    expect(g.comfortZonePct).toBeCloseTo(4.1667, 3);
  });

  it("grows the scale when a value exceeds the stated total so nothing falls off the track", () => {
    const g = pathwayBarGeometry({
      yourMarks: 800,
      cutoffMarks: 600,
      comfortMarks: 630,
      maxMarks: 720,
    });
    expect(g.scaleMax).toBe(800);
    expect(g.fillPct).toBe(100);
    expect(g.cutoffPct).toBeCloseTo(75, 6);
  });

  it("falls back to the plotted values when the total is unknown", () => {
    const g = pathwayBarGeometry({
      yourMarks: 40,
      cutoffMarks: 50,
      comfortMarks: 52.5,
      maxMarks: null,
    });
    expect(g.scaleMax).toBe(52.5);
    expect(g.cutoffPct).toBeCloseTo(95.238, 2);
  });

  it("clamps negative marks to an empty fill and never divides by zero", () => {
    const g = pathwayBarGeometry({
      yourMarks: -30,
      cutoffMarks: 300,
      comfortMarks: 315,
      maxMarks: 720,
    });
    expect(g.fillPct).toBe(0);

    const zero = pathwayBarGeometry({
      yourMarks: 0,
      cutoffMarks: 0,
      comfortMarks: 0,
      maxMarks: 0,
    });
    expect(zero.scaleMax).toBe(1);
    expect(zero.fillPct).toBe(0);
    expect(zero.comfortZonePct).toBe(0);
  });

  it("treats non-finite input as 0 instead of NaN", () => {
    const g = pathwayBarGeometry({
      yourMarks: Number.NaN,
      cutoffMarks: 100,
      comfortMarks: 105,
      maxMarks: 200,
    });
    expect(Number.isNaN(g.fillPct)).toBe(false);
  });
});

describe("formatMarks", () => {
  it("prints whole numbers plainly and decimals to one place", () => {
    expect(formatMarks(584)).toBe("584");
    expect(formatMarks(584.25)).toBe("584.3");
    expect(formatMarks(584.04)).toBe("584");
    expect(formatMarks(0)).toBe("0");
    expect(formatMarks(-3)).toBe("-3");
    expect(formatMarks(720)).toBe("720");
  });
});

describe("describePathwayBasis", () => {
  it("uses 'last N' when every mock in the window counts", () => {
    expect(
      describePathwayBasis({ attemptsConsidered: 10, attemptsInWindow: 10 })
    ).toBe("Based on your last 10 full mocks");
    expect(
      describePathwayBasis({ attemptsConsidered: 1, attemptsInWindow: 1 })
    ).toBe("Based on your last 1 full mock");
  });

  it("explains when only some mocks had a cut-off", () => {
    expect(
      describePathwayBasis({ attemptsConsidered: 8, attemptsInWindow: 10 })
    ).toBe("Based on 8 of your last 10 full mocks");
    expect(
      describePathwayBasis({ attemptsConsidered: 1, attemptsInWindow: 2 })
    ).toBe("Based on 1 of your last 2 full mocks");
  });

  it("copes with an empty window", () => {
    expect(
      describePathwayBasis({ attemptsConsidered: 0, attemptsInWindow: 0 })
    ).toBe("Based on your last 0 full mocks");
  });
});

describe("PATHWAY_BAND_LABEL", () => {
  it("has a label for every band", () => {
    expect(PATHWAY_BAND_LABEL).toEqual({
      below: "Below cut-off",
      borderline: "Within reach",
      comfortable: "Looking solid",
    });
  });
});
