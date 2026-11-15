import { describe, expect, it } from "vitest";
import { formatReviewTimer } from "@/lib/mistake-book/format-timer";

describe("formatReviewTimer", () => {
  it("formats zero and multi-minute values", () => {
    expect(formatReviewTimer(0)).toBe("00:00");
    expect(formatReviewTimer(65)).toBe("01:05");
    expect(formatReviewTimer(600)).toBe("10:00");
  });

  it("clamps negative values", () => {
    expect(formatReviewTimer(-12)).toBe("00:00");
  });
});
