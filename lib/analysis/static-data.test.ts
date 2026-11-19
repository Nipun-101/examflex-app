import { describe, expect, it } from "vitest";
import {
  ANALYSIS_PAGE_DATA,
  buildAnalysisPageData,
} from "@/lib/analysis/static-data";

describe("ANALYSIS_PAGE_DATA", () => {
  it("includes the empty-state outlook seed", () => {
    expect(ANALYSIS_PAGE_DATA.title).toBe("Your possibilities");
    expect(ANALYSIS_PAGE_DATA.illustrative).toBe(true);
    expect(ANALYSIS_PAGE_DATA.overview?.fullMocks.latest).toBeNull();
    expect(ANALYSIS_PAGE_DATA.overview?.pathways.offerings).toHaveLength(0);
  });

  it("buildAnalysisPageData marks live data", () => {
    const overview = ANALYSIS_PAGE_DATA.overview!;
    const live = buildAnalysisPageData(overview);
    expect(live.illustrative).toBe(false);
    expect(live.examBadge).toBe(overview.exam.name);
  });
});
