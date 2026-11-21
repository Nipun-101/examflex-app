import { describe, expect, it } from "vitest";
import {
  PATHWAY_BAND_LABEL,
  describePathwayBasis,
  formatMarks,
  pathwayBarGeometry,
  pathwayProgressColor,
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

describe("pathwayProgressColor", () => {
  it("is red at zero and the app green once the cut-off is reached or passed", () => {
    expect(pathwayProgressColor(0, 100)).toBe("rgb(200, 40, 45)");
    expect(pathwayProgressColor(100, 100)).toBe("rgb(23, 107, 86)");
    expect(pathwayProgressColor(150, 100)).toBe("rgb(23, 107, 86)");
  });

  it("gives different colours for 10, 25 and 90 out of 100", () => {
    const colors = [10, 25, 90].map((marks) => pathwayProgressColor(marks, 100));
    expect(new Set(colors).size).toBe(3);
  });

  it("depends on the ratio, not the absolute marks", () => {
    expect(pathwayProgressColor(25, 100)).toBe(pathwayProgressColor(250, 1000));
  });

  it("changes shade every 5% and holds it within a step", () => {
    const at = (percent: number) => pathwayProgressColor(percent, 100);
    expect(at(10)).toBe(at(14.9));
    expect(at(15)).not.toBe(at(14.9));
    expect(at(0)).toBe(at(4.9));
    const shades = Array.from({ length: 21 }, (_, step) => at(step * 5));
    expect(new Set(shades).size).toBe(21);
    expect(at(99)).toBe(at(95));
    expect(at(100)).toBe("rgb(23, 107, 86)");
  });

  it("separates students with the same marks but different cut-offs", () => {
    // Same 64.7 marks: MBBS cut-off 586.7 vs Ayush cut-off 430.
    const mbbs = pathwayProgressColor(64.7, 586.7);
    const ayush = pathwayProgressColor(64.7, 430);
    expect(mbbs).not.toBe(ayush);
    const green = (value: string) => Number((value.match(/\d+/g) ?? [])[1]);
    expect(green(ayush) - green(mbbs)).toBeGreaterThanOrEqual(40);
  });

  it("shifts from red toward green as the ratio grows", () => {
    const channels = (value: string) =>
      (value.match(/\d+/g) ?? []).map(Number) as [number, number, number];
    const [r10, g10] = channels(pathwayProgressColor(10, 100));
    const [r90, g90] = channels(pathwayProgressColor(90, 100));
    expect(g90).toBeGreaterThan(g10);
    expect(r90).toBeLessThan(r10);
    expect(g10).toBeLessThan(110); // still reads as red at 10%
  });

  it("is safe for a missing cut-off and for negative or non-finite marks", () => {
    expect(pathwayProgressColor(50, 0)).toBe("rgb(23, 107, 86)");
    expect(pathwayProgressColor(-5, 100)).toBe("rgb(200, 40, 45)");
    expect(pathwayProgressColor(Number.NaN, 100)).toBe("rgb(200, 40, 45)");
  });
});
