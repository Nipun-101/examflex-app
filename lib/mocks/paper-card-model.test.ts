import { describe, expect, it } from "vitest";
import {
  chapterPaperToCard,
  fullMockToCard,
  sprintTestToCard,
  UNTITLED_PAPER,
} from "@/lib/mocks/paper-card-model";
import type {
  ApiFullMockTest,
  ApiMockTest,
  ApiSprintTest,
  PaperListItemBase,
} from "@/types/mock-test";

const base: PaperListItemBase = {
  id: "p1",
  title: "Paper",
  description: null,
  totalQuestions: 20,
  durationInMinutes: 30,
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: null,
  allowRetake: true,
  shuffleOptions: false,
  showResultsImmediately: true,
  isActive: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const exam = { id: "e1", name: "NEET" };

const chapter: ApiMockTest = {
  ...base,
  exam,
  subject: { id: "s1", name: "Physics" },
  topic: { id: "t1", name: "Kinematics" },
  generationMode: "AUTO",
};

describe("chapterPaperToCard", () => {
  it("uses the title and Subject · Chapter subtitle", () => {
    expect(chapterPaperToCard(chapter)).toEqual({
      id: "p1",
      title: "Paper",
      subtitle: "Physics · Kinematics",
      totalQuestions: 20,
      durationInMinutes: 30,
      marksPerQuestion: 4,
      negativeMarking: 1,
    });
  });

  it("falls back to the topic, then the subject, for the title", () => {
    expect(chapterPaperToCard({ ...chapter, title: null }).title).toBe(
      "Kinematics"
    );
    const { topic: _topic, ...withoutTopic } = chapter;
    void _topic;
    const card = chapterPaperToCard({ ...withoutTopic, title: null });
    expect(card.title).toBe("Physics");
    expect(card.subtitle).toBe("Physics");
  });

  it("carries access fields through", () => {
    const card = chapterPaperToCard({
      ...chapter,
      accessMode: "ENTITLED",
      access: { allowed: false, reason: "ENTITLEMENT_REQUIRED" },
      userAttemptAction: "RESUME",
      resumeAttemptId: "a1",
    });
    expect(card).toMatchObject({
      accessMode: "ENTITLED",
      access: { allowed: false, reason: "ENTITLEMENT_REQUIRED" },
      userAttemptAction: "RESUME",
      resumeAttemptId: "a1",
    });
  });
});

describe("fullMockToCard", () => {
  const full: ApiFullMockTest = {
    ...base,
    exam,
    isSessionWise: false,
    subjectConfig: [],
  };

  it("labels single and session-wise papers", () => {
    expect(fullMockToCard(full).subtitle).toBe("Full paper");
    expect(fullMockToCard({ ...full, isSessionWise: true }).subtitle).toBe(
      "Session-wise"
    );
  });

  it("falls back to the exam name, then a placeholder", () => {
    expect(fullMockToCard({ ...full, title: null }).title).toBe("NEET");
    expect(fullMockToCard({ ...full, title: null, exam: null }).title).toBe(
      UNTITLED_PAPER
    );
  });
});

describe("sprintTestToCard", () => {
  const sprint: ApiSprintTest = { ...base, exam };

  it("labels sprint papers", () => {
    expect(sprintTestToCard(sprint)).toMatchObject({
      title: "Paper",
      subtitle: "Sprint",
    });
  });

  it("falls back to the exam name, then a placeholder", () => {
    expect(sprintTestToCard({ ...sprint, title: null }).title).toBe("NEET");
    expect(sprintTestToCard({ ...sprint, title: null, exam: null }).title).toBe(
      UNTITLED_PAPER
    );
  });
});
