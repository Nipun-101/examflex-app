import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  parseMistakeBookListSummary,
  parseMistakeBookSession,
  parseMistakeBookSessionDetail,
  parseMistakeItem,
  listMistakeBookSessions,
  patchMistakeTripReason,
  deleteMistakeBookEntry,
} from "@/lib/api/mistake-book";

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/lib/api/client";

describe("mistake-book API parsers", () => {
  it("parses a session row", () => {
    const session = parseMistakeBookSession({
      mockTestId: "mt1",
      attemptId: "at1",
      title: "Mock 12",
      paperType: "FULL_EXAM",
      remainingCount: 3,
      attemptSubmittedAt: "2026-11-17T10:00:00.000Z",
      subjectIds: ["s1", "s2"],
      subjectId: "s1",
      subjectLabel: "Physics",
    });
    expect(session?.title).toBe("Mock 12");
    expect(session?.remainingCount).toBe(3);
    expect(session?.subjectIds).toEqual(["s1", "s2"]);
    expect(session?.subjectLabel).toBe("Physics");
  });

  it("parses incorrect and unattended entries", () => {
    const incorrect = parseMistakeItem({
      id: "e1",
      kind: "incorrect",
      questionId: "q1",
      questionNumber: "Q1",
      subjectId: "s1",
      subjectLabel: "PHYSICS",
      prompt: "Prompt",
      imageUrl: "https://cdn.test/fig.png",
      yourAnswerLabel: "YOUR ANSWER · A",
      yourAnswer: "1",
      correctAnswerLabel: "CORRECT · B",
      correctAnswer: "2",
      insightTitle: "Solution",
      insightBody: "Body",
      insightFormula: "",
      sourceLabel: "",
      sourceHref: "",
      sourceHint: "hint",
      tripReason: "concept-gap",
    });
    expect(incorrect?.kind).toBe("incorrect");
    expect(incorrect?.imageUrl).toBe("https://cdn.test/fig.png");

    const unattended = parseMistakeItem({
      id: "e2",
      kind: "unattended",
      questionId: "q2",
      questionNumber: "Q2",
      subjectId: "s1",
      subjectLabel: "PHYSICS",
      prompt: "Prompt",
      correctAnswerLabel: "CORRECT · B",
      correctAnswer: "2",
      insightTitle: "Solution",
      insightBody: "",
      insightFormula: "",
      sourceLabel: "",
      sourceHref: "",
      sourceHint: "hint",
      tripReason: "time",
    });
    expect(unattended?.kind).toBe("unattended");
    expect(unattended?.yourAnswer).toBeUndefined();
  });

  const entryBase = {
    id: "e1",
    kind: "incorrect",
    questionId: "q1",
    questionNumber: "Q1",
    subjectId: "s1",
    subjectLabel: "CHEMISTRY",
    prompt: "Prompt",
    correctAnswerLabel: "CORRECT · B",
    correctAnswer: "2",
    insightTitle: "Solution",
    insightBody: "Body",
    insightFormula: "",
    sourceLabel: "",
    sourceHref: "",
    sourceHint: "hint",
    tripReason: "concept-gap",
  };

  it("parses the rank-1 NCERT citation and its status", () => {
    const item = parseMistakeItem({
      ...entryBase,
      citationStatus: "done",
      citations: [
        {
          title: "Potassium Dichromate",
          content: "Dichromate text",
          images: ["https://cdn.test/figure-7.jpg", "", 3],
          chapterName: "The d - and f -Block Elements",
          grade: "XII",
          pageNumber: 105,
          sourceDoc: "The_d_-_and_f_-Block_Elements.pdf",
        },
      ],
    });
    expect(item?.citationStatus).toBe("done");
    expect(item?.citation).toEqual({
      title: "Potassium Dichromate",
      content: "Dichromate text",
      images: ["https://cdn.test/figure-7.jpg"],
      chapterName: "The d - and f -Block Elements",
      grade: "XII",
      pageNumber: 105,
    });
    expect(item?.citation).not.toHaveProperty("sourceDoc");
  });

  it("keeps the entry when citation fields are missing or malformed", () => {
    const missing = parseMistakeItem(entryBase);
    expect(missing?.id).toBe("e1");
    expect(missing?.citation).toBeUndefined();
    expect(missing?.citationStatus).toBeUndefined();

    const malformed = parseMistakeItem({
      ...entryBase,
      citationStatus: "unknown",
      citations: [{ title: 5 }, "bad"],
    });
    expect(malformed?.id).toBe("e1");
    expect(malformed?.citation).toBeUndefined();
    expect(malformed?.citationStatus).toBeUndefined();

    const nullStatus = parseMistakeItem({
      ...entryBase,
      citationStatus: null,
      citations: {},
    });
    expect(nullStatus?.citation).toBeUndefined();
  });

  it("parses session detail", () => {
    const detail = parseMistakeBookSessionDetail({
      mockTestId: "mt1",
      attemptId: "at1",
      title: "Mock 12",
      paperType: "FULL_EXAM",
      remainingCount: 1,
      attemptSubmittedAt: "2026-11-17T10:00:00.000Z",
      subjects: [{ id: "s1", label: "Physics" }],
      chapters: [{ id: "t1", label: "Laws", subjectId: "s1" }],
      entries: [
        {
          id: "e1",
          kind: "incorrect",
          questionId: "q1",
          questionNumber: "Q1",
          subjectId: "s1",
          subjectLabel: "PHYSICS",
          prompt: "Prompt",
          yourAnswerLabel: "YOUR ANSWER · A",
          yourAnswer: "1",
          correctAnswerLabel: "CORRECT · B",
          correctAnswer: "2",
          insightTitle: "Solution",
          insightBody: "Body",
          insightFormula: "",
          sourceLabel: "",
          sourceHref: "",
          sourceHint: "hint",
          tripReason: "concept-gap",
        },
      ],
    });
    expect(detail?.entries).toHaveLength(1);
  });
});

describe("mistake-book API clients", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("parses the list summary", () => {
    expect(
      parseMistakeBookListSummary({
        totalMistakes: 22,
        sessionCount: 4,
        bySubject: [{ id: "s1", label: "Physics", count: 15 }],
        subjects: [{ id: "s1", label: "Physics" }],
        chapters: [{ id: "t1", label: "Kinematics", subjectId: "s1" }],
        startWith: { mockTestId: "mt1", title: "Kinematics - 1" },
      })
    ).toEqual({
      totalMistakes: 22,
      sessionCount: 4,
      bySubject: [{ id: "s1", label: "Physics", count: 15 }],
      subjects: [{ id: "s1", label: "Physics" }],
      chapters: [{ id: "t1", label: "Kinematics", subjectId: "s1" }],
      startWith: { mockTestId: "mt1", title: "Kinematics - 1" },
    });
  });

  it("lists sessions from the paginated envelope", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "ok",
          data: [
            {
              mockTestId: "mt1",
              attemptId: "at1",
              title: "Mock 12",
              paperType: "FULL_EXAM",
              remainingCount: 2,
              attemptSubmittedAt: "2026-11-17T10:00:00.000Z",
              subjectIds: ["s1"],
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
          summary: {
            totalMistakes: 2,
            sessionCount: 1,
            bySubject: [{ id: "s1", label: "Physics", count: 2 }],
            subjects: [{ id: "s1", label: "Physics" }],
            chapters: [{ id: "t1", label: "Mechanics", subjectId: "s1" }],
            startWith: { mockTestId: "mt1", title: "Mock 12" },
          },
        }),
        { status: 200 }
      )
    );

    const result = await listMistakeBookSessions({
      subjectId: "s1",
      topicId: "t1",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.data[0]?.mockTestId).toBe("mt1");
      expect(result.data.summary.totalMistakes).toBe(2);
      expect(result.data.summary.subjects).toHaveLength(1);
    }
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringMatching(/subjectId=s1.*topicId=t1|topicId=t1.*subjectId=s1/),
      expect.any(Object)
    );
  });

  it("patches trip reason and deletes entries with 204", async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 204 }));

    const patched = await patchMistakeTripReason("e1", "calculation");
    expect(patched.ok).toBe(true);

    const deleted = await deleteMistakeBookEntry("e1");
    expect(deleted.ok).toBe(true);
  });
});
