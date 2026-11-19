import { describe, expect, it } from "vitest";
import {
  MISTAKE_SUMMARY_BAR_COLORS,
  mistakeSummaryBarColor,
} from "@/lib/mistake-book/summary-bar-colors";

describe("mistakeSummaryBarColor", () => {
  it("gives adjacent indices different colors", () => {
    expect(mistakeSummaryBarColor(0)).not.toBe(mistakeSummaryBarColor(1));
    expect(mistakeSummaryBarColor(1)).not.toBe(mistakeSummaryBarColor(2));
  });

  it("does not depend on subject names", () => {
    // Same index → same color whether the label is Physics or Physics Core.
    expect(mistakeSummaryBarColor(0)).toBe(MISTAKE_SUMMARY_BAR_COLORS[0]);
    expect(mistakeSummaryBarColor(1)).toBe(MISTAKE_SUMMARY_BAR_COLORS[1]);
  });

  it("cycles when there are more subjects than swatches", () => {
    const n = MISTAKE_SUMMARY_BAR_COLORS.length;
    expect(mistakeSummaryBarColor(n)).toBe(MISTAKE_SUMMARY_BAR_COLORS[0]);
  });
});
