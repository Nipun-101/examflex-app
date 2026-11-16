import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatElapsed,
  formatScore,
  formatTimeTaken,
  timerTone,
} from "@/lib/mocks/attempt-format";

describe("formatElapsed", () => {
  it("formats minutes and hours", () => {
    expect(formatElapsed(724)).toBe("12m 04s");
    expect(formatElapsed(3909)).toBe("1h 05m 09s");
  });

  it("clamps negatives and fractions", () => {
    expect(formatElapsed(-5)).toBe("0m 00s");
    expect(formatElapsed(59.9)).toBe("0m 59s");
  });
});

describe("formatClock", () => {
  it("pads minutes and seconds, shows hours only when needed", () => {
    expect(formatClock(249)).toBe("04:09");
    expect(formatClock(3849)).toBe("1:04:09");
    expect(formatClock(-1)).toBe("00:00");
  });
});

describe("formatTimeTaken", () => {
  it("picks the shortest readable unit", () => {
    expect(formatTimeTaken(45)).toBe("45s");
    expect(formatTimeTaken(125)).toBe("2m 5s");
    expect(formatTimeTaken(7500)).toBe("2h 5m");
  });
});

describe("formatScore", () => {
  it("trims trailing zeros", () => {
    expect(formatScore(4)).toBe("4");
    expect(formatScore(3.5)).toBe("3.5");
    expect(formatScore(1.239)).toBe("1.24");
  });
});

describe("timerTone", () => {
  it("escalates near the end", () => {
    expect(timerTone(900)).toBe("normal");
    expect(timerTone(300)).toBe("warning");
    expect(timerTone(61)).toBe("warning");
    expect(timerTone(60)).toBe("critical");
    expect(timerTone(0)).toBe("critical");
  });
});
