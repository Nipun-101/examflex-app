import { describe, expect, it } from "vitest";
import {
  formatPaperCardClock,
  formatPaperCardDuration,
} from "@/lib/mocks/paper-card-format";

describe("formatPaperCardClock", () => {
  it("formats mm:ss with padding", () => {
    expect(formatPaperCardClock(0)).toBe("0:00");
    expect(formatPaperCardClock(65)).toBe("1:05");
    expect(formatPaperCardClock(370)).toBe("6:10");
  });

  it("clamps negatives", () => {
    expect(formatPaperCardClock(-12)).toBe("0:00");
  });
});

describe("formatPaperCardDuration", () => {
  it("formats seconds and mixed durations", () => {
    expect(formatPaperCardDuration(45)).toBe("45s");
    expect(formatPaperCardDuration(60)).toBe("1m");
    expect(formatPaperCardDuration(460)).toBe("7m 40s");
  });
});
