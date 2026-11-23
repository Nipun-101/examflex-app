import { describe, expect, it } from "vitest";
import {
  chapterPaperToCard,
  fullMockToCard,
  resolvePaperCardStatus,
  resolveTotalMarks,
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

describe("resolvePaperCardStatus", () => {
  it("maps attempt actions to card status", () => {
    expect(resolvePaperCardStatus({})).toBe("new");
    expect(
      resolvePaperCardStatus({
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
      })
    ).toBe("in_progress");
    expect(resolvePaperCardStatus({ userAttemptAction: "RETAKE" })).toBe(
      "completed"
    );
  });
});

describe("resolveTotalMarks", () => {
  it("uses API totalMarks when present", () => {
    expect(resolveTotalMarks({ ...base, totalMarks: 72 })).toBe(72);
  });

  it("falls back to questions × marks", () => {
    expect(resolveTotalMarks(base)).toBe(80);
  });
});

describe("chapterPaperToCard", () => {
  it("keeps subject/topic, eyebrow, and totalMarks", () => {
    expect(chapterPaperToCard(chapter)).toMatchObject({
      id: "p1",
      title: "Paper",
      subtitle: "Physics · Kinematics",
      eyebrow: "PHYSICS · KINEMATICS",
      kind: "chapter",
      subjectName: "Physics",
      topicName: "Kinematics",
      totalQuestions: 20,
      durationInMinutes: 30,
      totalMarks: 80,
      marksPerQuestion: 4,
      negativeMarking: 1,
      allowRetake: true,
      status: "new",
      attemptCount: 0,
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
    expect(card.subjectName).toBe("Physics");
    expect(card.topicName).toBeNull();
  });

  it("maps attemptSummary onto completed card fields", () => {
    const card = chapterPaperToCard({
      ...chapter,
      userAttemptAction: "RETAKE",
      totalMarks: 72,
      attemptSummary: {
        status: "COMPLETED",
        attemptCount: 2,
        bestScore: 32,
        bestCorrectAnswers: 8,
        lastAttemptId: "a9",
        lastScore: 28,
        lastTimeTakenSeconds: 460,
        lastIncorrectAnswers: 3,
      },
    });
    expect(card).toMatchObject({
      status: "completed",
      totalMarks: 72,
      attemptCount: 2,
      bestScore: 32,
      bestCorrectAnswers: 8,
      lastAttemptId: "a9",
      lastIncorrectAnswers: 3,
    });
  });

  it("carries access fields through", () => {
    const card = chapterPaperToCard({
      ...chapter,
      accessMode: "ENTITLED",
      access: { allowed: false, reason: "ENTITLEMENT_REQUIRED" },
      userAttemptAction: "RESUME",
      resumeAttemptId: "a1",
      attemptSummary: {
        status: "IN_PROGRESS",
        attemptCount: 0,
        answeredCount: 4,
        timeRemainingSeconds: 370,
      },
    });
    expect(card).toMatchObject({
      accessMode: "ENTITLED",
      access: { allowed: false, reason: "ENTITLEMENT_REQUIRED" },
      userAttemptAction: "RESUME",
      resumeAttemptId: "a1",
      status: "in_progress",
      answeredCount: 4,
      timeRemainingSeconds: 370,
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

  it("labels full mocks without a subject theme", () => {
    expect(fullMockToCard(full)).toMatchObject({
      eyebrow: "FULL MOCK",
      kind: "full",
      subjectName: null,
      subtitle: "Full paper",
    });
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
      subtitle: "Rapid Round",
      eyebrow: "RAPID ROUND",
      kind: "sprint",
    });
  });

  it("falls back to the exam name, then a placeholder", () => {
    expect(sprintTestToCard({ ...sprint, title: null }).title).toBe("NEET");
    expect(sprintTestToCard({ ...sprint, title: null, exam: null }).title).toBe(
      UNTITLED_PAPER
    );
  });
});
