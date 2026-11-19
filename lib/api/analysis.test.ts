import { describe, expect, it } from "vitest";
import { parseAnalysisOverview } from "@/lib/api/analysis";

const sample = {
  exam: { id: "e1", name: "NEET UG", totalMarks: 720 },
  fullMocks: {
    completedCount: 1,
    targetCount: 5,
    needsMoreAttempts: true,
    latest: {
      attemptId: "a1",
      title: "Mock 12",
      score: 548,
      maxScore: 720,
      percent: 76.1,
      submittedAt: "2026-01-02T00:00:00.000Z",
      deltaFromPrevious: null,
      correctCount: 140,
      incorrectCount: 30,
      skippedCount: 10,
    },
    recent: [
      {
        attemptId: "a1",
        label: "Mock 1",
        title: "Mock 12",
        score: 548,
        maxScore: 720,
        percent: 76.1,
        submittedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
  },
  pathways: {
    averagePercent: 76.1,
    attemptCountUsed: 1,
    offerings: [
      {
        id: "o1",
        title: "MBBS",
        subtitle: "Medicine",
        minPercent: 80,
        comfortPercent: 90,
        userPercent: 76.1,
        progress01: 0.95,
        band: "below",
        message: "A strong stretch — keep climbing toward this path.",
      },
    ],
  },
  subjects: {
    source: "TOPIC_WISE",
    attemptCount: 0,
    needsMoreAttempts: true,
    items: [],
  },
  engagement: {
    hasFullMocks: true,
    hasChapterWise: false,
    fullMockTarget: 5,
    fullMocksRemaining: 4,
  },
};

describe("parseAnalysisOverview", () => {
  it("parses a valid overview payload", () => {
    const result = parseAnalysisOverview(sample);
    expect(result?.exam.name).toBe("NEET UG");
    expect(result?.fullMocks.latest?.score).toBe(548);
    expect(result?.pathways.offerings[0]?.band).toBe("below");
  });

  it("rejects malformed payloads", () => {
    expect(parseAnalysisOverview(null)).toBeNull();
    expect(parseAnalysisOverview({ exam: { id: "e1" } })).toBeNull();
  });
});
