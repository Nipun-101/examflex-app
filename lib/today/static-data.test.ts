import { describe, expect, it } from "vitest";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("TODAY_PAGE_DATA", () => {
  it("ships the active fixture without the concept footer", () => {
    expect(TODAY_PAGE_DATA.overview.headline).toBe("One good step at a time.");
    expect(TODAY_PAGE_DATA.latestMock.score).toBe(548);
    expect(TODAY_PAGE_DATA.subjectInsights.items).toHaveLength(3);
    expect(TODAY_PAGE_DATA.perspective.ctaHref).toBe("/analysis");
    expect(TODAY_PAGE_DATA.perspective.locked).toBe(false);
    expect(TODAY_PAGE_DATA).not.toHaveProperty("footerLeft");
    expect(TODAY_PAGE_DATA.footerRight).toMatch(/Illustrative data/);
  });
});

describe("TODAY_EMPTY_SEED", () => {
  it("matches the new-user empty design contract", () => {
    expect(TODAY_EMPTY_SEED.mode).toBe("empty");
    expect(TODAY_EMPTY_SEED.latestMock.score).toBeNull();
    expect(TODAY_EMPTY_SEED.nextStep.showPath).toBe(true);
    expect(TODAY_EMPTY_SEED.perspective.locked).toBe(true);
    expect(TODAY_EMPTY_SEED.sessionPlan.steps.map((s) => s.state)).toEqual([
      "active",
      "active",
      "active",
    ]);
  });
});
