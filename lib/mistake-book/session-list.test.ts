import { describe, expect, it } from "vitest";
import {
  groupSessionsByRecency,
  mistakeDotCount,
  mistakePaperKind,
  sessionBreadcrumb,
  subjectBarSegmentRadiusClass,
  subjectSegmentPercent,
} from "@/lib/mistake-book/session-list";
import type { MistakeBookSession } from "@/types/mistake-book";

function session(
  overrides: Partial<MistakeBookSession> & { attemptSubmittedAt: string }
): MistakeBookSession {
  return {
    mockTestId: "mt1",
    attemptId: "at1",
    title: "Paper",
    paperType: "TOPIC_WISE",
    remainingCount: 3,
    subjectIds: [],
    ...overrides,
  };
}

describe("mistakePaperKind", () => {
  it("maps paper types to paper-card kinds", () => {
    expect(mistakePaperKind("TOPIC_WISE")).toBe("chapter");
    expect(mistakePaperKind("FULL_EXAM")).toBe("full");
    expect(mistakePaperKind("SPRINT")).toBe("sprint");
  });
});

describe("sessionBreadcrumb", () => {
  it("joins subject and topic when both exist", () => {
    expect(
      sessionBreadcrumb({
        subjectLabel: "Physics Core",
        topicLabel: "Kinematics",
      })
    ).toBe("Physics Core · Kinematics");
  });

  it("falls back to a single side", () => {
    expect(sessionBreadcrumb({ subjectLabel: "Physics" })).toBe("Physics");
    expect(sessionBreadcrumb({ topicLabel: "Kinematics" })).toBe("Kinematics");
    expect(sessionBreadcrumb({})).toBe("");
  });
});

describe("mistakeDotCount", () => {
  it("caps dots at a full NEET paper (180)", () => {
    expect(mistakeDotCount(0)).toBe(0);
    expect(mistakeDotCount(9)).toBe(9);
    expect(mistakeDotCount(40)).toBe(40);
    expect(mistakeDotCount(180)).toBe(180);
    expect(mistakeDotCount(220)).toBe(180);
  });
});

describe("subjectSegmentPercent", () => {
  it("returns a percentage of the total", () => {
    expect(subjectSegmentPercent(15, 22)).toBe(68.2);
    expect(subjectSegmentPercent(0, 22)).toBe(0);
    expect(subjectSegmentPercent(4, 0)).toBe(0);
  });
});

describe("subjectBarSegmentRadiusClass", () => {
  it("rounds only the outer ends of a multi-segment bar", () => {
    expect(subjectBarSegmentRadiusClass(0, 3)).toBe("rounded-l-full");
    expect(subjectBarSegmentRadiusClass(1, 3)).toBe("rounded-none");
    expect(subjectBarSegmentRadiusClass(2, 3)).toBe("rounded-r-full");
  });

  it("fully rounds a single segment", () => {
    expect(subjectBarSegmentRadiusClass(0, 1)).toBe("rounded-full");
  });
});

describe("groupSessionsByRecency", () => {
  it("buckets sessions into today, earlier this week, and older", () => {
    // Wednesday 18 Nov 2026 local reference
    const now = new Date(2026, 10, 18, 15, 0, 0);
    const groups = groupSessionsByRecency(
      [
        session({
          mockTestId: "today",
          attemptSubmittedAt: new Date(2026, 10, 18, 9, 0, 0).toISOString(),
        }),
        session({
          mockTestId: "week",
          attemptSubmittedAt: new Date(2026, 10, 16, 12, 0, 0).toISOString(),
        }),
        session({
          mockTestId: "old",
          attemptSubmittedAt: new Date(2026, 10, 1, 12, 0, 0).toISOString(),
        }),
      ],
      now
    );

    expect(groups.today.map((row) => row.mockTestId)).toEqual(["today"]);
    expect(groups.earlierThisWeek.map((row) => row.mockTestId)).toEqual([
      "week",
    ]);
    expect(groups.older.map((row) => row.mockTestId)).toEqual(["old"]);
  });
});
