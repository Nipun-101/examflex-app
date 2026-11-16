import { describe, expect, it } from "vitest";
import {
  formatCount,
  formatDurationMinutes,
  formatDurationPreset,
  formatMarksPerQuestion,
  formatPaiseAsRupees,
} from "@/lib/mocks/format";

describe("mock formatters", () => {
  it("formats durations", () => {
    expect(formatDurationMinutes(undefined)).toBe("—");
    expect(formatDurationMinutes(0)).toBe("—");
    expect(formatDurationMinutes(45)).toBe("45 min");
    expect(formatDurationMinutes(180)).toBe("3h");
    expect(formatDurationMinutes(200)).toBe("3h 20min");
  });

  it("formats counts and marks", () => {
    expect(formatCount(null)).toBe("—");
    expect(formatCount(undefined)).toBe("—");
    expect(formatCount(0)).toBe("0");
    expect(formatMarksPerQuestion(1)).toBe("1 mark/Q");
    expect(formatMarksPerQuestion(4)).toBe("4 marks/Q");
  });

  it("formats paise as rupees", () => {
    expect(formatPaiseAsRupees(49900)).toBe("₹499");
    expect(formatPaiseAsRupees(49950)).toBe("₹499.5");
  });

  it("labels duration presets", () => {
    expect(formatDurationPreset("3M")).toBe("3 months");
    expect(formatDurationPreset("LIFETIME")).toBe("Lifetime");
    expect(formatDurationPreset("WEIRD")).toBe("WEIRD");
  });
});
