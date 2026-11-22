import { describe, expect, it } from "vitest";
import {
  accuracyView,
  latestMockMetrics,
  marksView,
  nextGoalView,
  timeView,
} from "@/lib/analysis/latest-mock-metrics";
import type { AnalysisLatestFullMock } from "@/types/analysis";

const latest: AnalysisLatestFullMock = {
  attemptId: "a1",
  title: "Mock 1",
  score: 8,
  maxScore: 720,
  percent: 1.1,
  submittedAt: "2026-01-01T00:00:00Z",
  deltaFromPrevious: null,
  correctCount: 6,
  incorrectCount: 16,
  skippedCount: 158,
  marksPerCorrect: 4,
  negativeMarking: 1,
  durationInMinutes: 180,
  timeTakenSeconds: 462,
};

describe("latest mock metrics", () => {
  it("returns null without question counts", () => {
    const rest: AnalysisLatestFullMock = { ...latest };
    delete rest.correctCount;
    expect(latestMockMetrics(rest)).toBeNull();
    expect(latestMockMetrics(null)).toBeNull();
  });

  it("computes accuracy and break-even", () => {
    const m = latestMockMetrics(latest)!;
    const acc = accuracyView(m)!;
    expect(acc.accuracy01).toBeCloseTo(6 / 22);
    expect(acc.breakEven01).toBeCloseTo(0.2);
  });

  it("computes marks left on the table", () => {
    const view = marksView(latestMockMetrics(latest)!);
    expect(view.leftOnTable).toBe(632);
    expect(view.wrongPotential).toBe(64);
    expect(view.penalty).toBe(16);
    expect(view.perTenSkips).toBe(40);
  });

  it("computes time usage", () => {
    const view = timeView(latestMockMetrics(latest)!)!;
    expect(view.durationMinutes).toBe(180);
    expect(view.avgSecondsPerAttempted).toBeCloseTo(21);
    expect(view.allottedSecondsPerQuestion).toBeCloseTo(60);
  });

  it("computes the next milestone", () => {
    const goal = nextGoalView(latestMockMetrics(latest)!);
    expect(goal).toMatchObject({ done: false, milestone: 100, correctNeeded: 23 });
  });

  it("hides time when the API omits it", () => {
    const rest: AnalysisLatestFullMock = { ...latest };
    delete rest.timeTakenSeconds;
    expect(timeView(latestMockMetrics(rest)!)).toBeNull();
  });
});
