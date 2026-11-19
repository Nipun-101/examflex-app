import { describe, expect, it } from "vitest";
import { parseTodayPageData } from "@/lib/api/today";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("parseTodayPageData", () => {
  it("accepts the empty seed shape", () => {
    const parsed = parseTodayPageData({
      ...TODAY_EMPTY_SEED,
      examId: "507f1f77bcf86cd799439011",
    });
    expect(parsed?.mode).toBe("empty");
    expect(parsed?.latestMock.score).toBeNull();
    expect(parsed?.perspective.locked).toBe(true);
  });

  it("accepts the active fixture shape", () => {
    const parsed = parseTodayPageData({
      ...TODAY_PAGE_DATA,
      examId: "507f1f77bcf86cd799439011",
      latestMock: {
        ...TODAY_PAGE_DATA.latestMock,
        deltaLabel: TODAY_PAGE_DATA.latestMock.deltaLabel,
        breakdown: TODAY_PAGE_DATA.latestMock.breakdown,
        placeholderMessage: null,
      },
      subjectInsights: {
        ...TODAY_PAGE_DATA.subjectInsights,
        subhead: null,
      },
    });
    expect(parsed?.mode).toBe("active");
    expect(parsed?.latestMock.score).toBe(548);
    expect(parsed?.subjectInsights.items[0]?.scoreLabel).toBe("62%");
  });

  it("rejects malformed payloads", () => {
    expect(parseTodayPageData(null)).toBeNull();
    expect(parseTodayPageData({ mode: "empty" })).toBeNull();
  });
});
