import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getFullMockTests,
  parseApiFullMockTest,
  parseFullMockTestsPage,
} from "@/lib/api/full-mock-tests";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

const pagination = {
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const fullMock = {
  id: "f1",
  title: "NEET Full Mock 1",
  description: "Full paper",
  totalQuestions: 180,
  durationInMinutes: 200,
  totalMarks: 720,
  isSessionWise: true,
  exam: { id: "e1", name: "NEET" },
  subjectConfig: [
    {
      subject: "s1",
      name: "Physics",
      numberOfQuestions: 45,
      marksPerQuestion: 4,
      hasNegativeMarking: true,
      negativeMarksPerQuestion: 1,
      sessionTime: 50,
      questionStartIndex: 0,
      questionEndIndex: 44,
    },
  ],
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: 300,
  allowRetake: true,
  shuffleOptions: false,
  showResultsImmediately: true,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  accessMode: "FREE",
  access: { allowed: true, reason: "FREE_PAPER" },
  userAttemptAction: "RESUME",
  resumeAttemptId: "a1",
};

describe("parseApiFullMockTest", () => {
  it("parses a full mock", () => {
    expect(parseApiFullMockTest(fullMock)).toEqual(fullMock);
  });

  it("applies defaults for optional fields", () => {
    const parsed = parseApiFullMockTest({
      ...fullMock,
      totalMarks: undefined,
      isSessionWise: undefined,
      exam: undefined,
      subjectConfig: undefined,
    });
    expect(parsed).toMatchObject({
      isSessionWise: false,
      exam: null,
      subjectConfig: [],
    });
    expect(parsed).not.toHaveProperty("totalMarks");
  });

  it("applies subject config defaults and drops invalid entries", () => {
    const parsed = parseApiFullMockTest({
      ...fullMock,
      subjectConfig: [
        {
          subject: "s2",
          numberOfQuestions: 45,
          marksPerQuestion: 4,
          questionStartIndex: 45,
          questionEndIndex: 89,
        },
        null,
        { ...fullMock.subjectConfig[0], subject: 1 },
        { ...fullMock.subjectConfig[0], numberOfQuestions: "45" },
        { ...fullMock.subjectConfig[0], marksPerQuestion: undefined },
        { ...fullMock.subjectConfig[0], questionStartIndex: null },
        { ...fullMock.subjectConfig[0], questionEndIndex: "x" },
      ],
    });
    expect(parsed?.subjectConfig).toEqual([
      {
        subject: "s2",
        name: "",
        numberOfQuestions: 45,
        marksPerQuestion: 4,
        hasNegativeMarking: false,
        negativeMarksPerQuestion: 0,
        questionStartIndex: 45,
        questionEndIndex: 89,
      },
    ]);
  });

  it("rejects invalid papers", () => {
    expect(parseApiFullMockTest(null)).toBeNull();
    expect(parseApiFullMockTest({ ...fullMock, id: undefined })).toBeNull();
  });
});

describe("parseFullMockTestsPage", () => {
  it("parses a page", () => {
    expect(
      parseFullMockTestsPage({ data: [fullMock, null], pagination })
    ).toEqual({ data: [fullMock], pagination });
    expect(parseFullMockTestsPage({ data: [] })).toBeNull();
  });
});

describe("getFullMockTests", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  it("fetches without params", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: [fullMock], pagination })
    );
    const result = await getFullMockTests();
    expect(result).toEqual({ ok: true, data: { data: [fullMock], pagination } });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/full-mock-tests",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("sends examId, page and limit", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: [], pagination })
    );
    await getFullMockTests({ examId: "e1", page: 3, limit: 20 });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/full-mock-tests?examId=e1&page=3&limit=20",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns API, malformed and network failures", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Unauthorized" }, 401)
    );
    expect(await getFullMockTests()).toEqual({
      ok: false,
      status: 401,
      message: "Unauthorized",
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: [] }));
    const malformed = await getFullMockTests();
    expect(malformed.ok).toBe(false);

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const offline = await getFullMockTests();
    expect(offline.ok).toBe(false);
  });
});
