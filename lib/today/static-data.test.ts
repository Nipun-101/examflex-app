import { describe, expect, it } from "vitest";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("TODAY_PAGE_DATA", () => {
  it("ships the Figma Today copy without the concept footer", () => {
    expect(TODAY_PAGE_DATA.headline).toBe("One good step at a time.");
    expect(TODAY_PAGE_DATA.latestMock.score).toBe(548);
    expect(TODAY_PAGE_DATA.subjectInsights).toHaveLength(3);
    expect(TODAY_PAGE_DATA.perspective.ctaHref).toBe("/analysis");
    expect(TODAY_PAGE_DATA).not.toHaveProperty("footerLeft");
    expect(TODAY_PAGE_DATA.footerRight).toMatch(/Illustrative data/);
  });
});
