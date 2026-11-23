import { describe, expect, it } from "vitest";
import {
  attemptExitHref,
  attemptExitLabel,
  attemptSectionLabel,
  attemptTitle,
  paperListLabel,
  treatMissingAsFullMock,
} from "@/lib/mocks/attempt-meta";
import type { AttemptMockTestData, AttemptSession } from "@/types/attempt";

function meta(overrides: Partial<AttemptMockTestData> = {}): AttemptMockTestData {
  return {
    title: null,
    durationInMinutes: 60,
    totalQuestions: 10,
    startedAt: "2026-01-01T00:00:00.000Z",
    marksPerQuestion: 4,
    negativeMarking: 1,
    passingScore: null,
    exam: { id: "ex1", name: " NEET ", description: "" },
    ...overrides,
  };
}

describe("exit paths", () => {
  it("routes chapter-wise papers to the Chapter Wise list", () => {
    const data = meta({
      paperType: "TOPIC_WISE",
      subject: { id: "s", name: "Physics" },
    });
    expect(attemptExitHref(data)).toBe("/mocks/exam/ex1/chapter-wise");
    expect(attemptExitLabel(data)).toBe("Exit to Chapter Wise");
  });

  it("routes sprint and full mocks", () => {
    expect(attemptExitHref(meta({ paperType: "SPRINT" }))).toBe(
      "/mocks/exam/ex1/rapid-rounds"
    );
    expect(attemptExitLabel(meta({ paperType: "FULL_EXAM" }))).toBe(
      "Exit to Full Mocks"
    );
  });

  it("treats a payload without paper type, subject or topic as a full mock", () => {
    const data = meta();
    expect(treatMissingAsFullMock(data)).toBe(true);
    expect(attemptExitHref(data)).toBe("/mocks/exam/ex1/full-mocks");
    expect(attemptExitLabel(data)).toBe("Exit to Full Mocks");
  });

  it("keeps a missing paper type with a topic in Chapter Wise", () => {
    const data = meta({ topic: { id: "t", name: "Optics" } });
    expect(treatMissingAsFullMock(data)).toBe(false);
    expect(attemptExitHref(data)).toBe("/mocks/exam/ex1/chapter-wise");
  });

  it("falls back to /mocks without an exam id", () => {
    const data = meta({ exam: { id: "", name: "NEET", description: "" } });
    expect(attemptExitHref(data)).toBe("/mocks");
  });
});

describe("paperListLabel", () => {
  it("names each list", () => {
    expect(paperListLabel("SPRINT", false)).toBe("Rapid Rounds");
    expect(paperListLabel("FULL_EXAM", false)).toBe("Full Mocks");
    expect(paperListLabel(undefined, true)).toBe("Full Mocks");
    expect(paperListLabel("TOPIC_WISE", true)).toBe("Chapter Wise");
    expect(paperListLabel(undefined, false)).toBe("Chapter Wise");
  });
});

describe("attemptTitle", () => {
  it("prefers the paper title", () => {
    expect(attemptTitle(meta({ title: "Mock 3" }))).toBe("Mock 3");
  });

  it("appends the topic to the exam name", () => {
    expect(attemptTitle(meta({ topic: { id: "t", name: "Optics" } }))).toBe(
      "NEET - Optics"
    );
  });

  it("falls back to the trimmed exam name", () => {
    expect(attemptTitle(meta())).toBe("NEET");
  });
});

describe("attemptSectionLabel", () => {
  const session: AttemptSession = {
    subject: "PHY",
    name: "Physics A",
    order: 0,
    durationInMinutes: 60,
    startIndex: 0,
    endIndex: 9,
    status: "IN_PROGRESS",
    timeConsumed: 0,
  };

  it("prefers session, then subject, then exam", () => {
    expect(attemptSectionLabel(meta(), session)).toBe("Physics A");
    expect(
      attemptSectionLabel(meta({ subject: { id: "s", name: "Chemistry" } }), null)
    ).toBe("Chemistry");
    expect(attemptSectionLabel(meta(), null)).toBe(" NEET ");
  });
});
