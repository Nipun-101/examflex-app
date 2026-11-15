import { describe, expect, it } from "vitest";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

describe("ANALYSIS_PAGE_DATA", () => {
  it("includes the Figma seed outlook", () => {
    expect(ANALYSIS_PAGE_DATA.title).toBe("Your possibilities");
    expect(ANALYSIS_PAGE_DATA.performance.score).toBe(548);
    expect(ANALYSIS_PAGE_DATA.pathways).toHaveLength(3);
    expect(ANALYSIS_PAGE_DATA.pathways[0]?.title).toBe("MBBS");
  });
});
