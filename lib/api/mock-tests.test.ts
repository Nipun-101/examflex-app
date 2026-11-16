import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMockTestsByExam,
  parseMockTest,
  parseMockTestsPage,
} from "@/lib/api/mock-tests";

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

const mockTest = {
  id: "m1",
  title: "Kinematics",
  description: "Motion in a line",
  totalQuestions: 20,
  durationInMinutes: 30,
  exam: { id: "e1", name: "NEET", description: "Medical" },
  subject: { id: "s1", name: "Physics" },
  topic: { id: "t1", name: "Kinematics" },
  generationMode: "DYNAMIC",
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: 40,
  allowRetake: true,
  shuffleOptions: false,
  showResultsImmediately: true,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  accessMode: "ENTITLED",
  access: { allowed: false, reason: "NO_ENTITLEMENT" },
  userAttemptAction: "START",
};

describe("parseMockTest", () => {
  it("parses a full chapter-wise paper", () => {
    expect(parseMockTest(mockTest)).toEqual(mockTest);
  });

  it("parses papers without a topic or generation mode", () => {
    const parsed = parseMockTest({
      ...mockTest,
      topic: undefined,
      generationMode: undefined,
    });
    expect(parsed).toMatchObject({ generationMode: "" });
    expect(parsed).not.toHaveProperty("topic");
  });

  it("drops a malformed topic", () => {
    expect(parseMockTest({ ...mockTest, topic: { id: 1 } })).not.toHaveProperty(
      "topic"
    );
  });

  it("rejects invalid papers", () => {
    expect(parseMockTest(null)).toBeNull();
    expect(parseMockTest({ id: "mt1" })).toBeNull();
    expect(parseMockTest({ ...mockTest, id: 1 })).toBeNull();
    expect(parseMockTest({ ...mockTest, exam: null })).toBeNull();
    expect(parseMockTest({ ...mockTest, subject: { id: "s1" } })).toBeNull();
    expect(parseMockTest({ ...mockTest, subject: "Physics" })).toBeNull();
  });
});

describe("parseMockTestsPage", () => {
  it("parses a page and drops invalid items", () => {
    expect(
      parseMockTestsPage({ data: [mockTest, { id: 1 }], pagination })
    ).toEqual({ data: [mockTest], pagination });
  });

  it("returns null when the envelope is malformed", () => {
    expect(parseMockTestsPage({ data: [mockTest] })).toBeNull();
  });
});

describe("getMockTestsByExam", () => {
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
      jsonResponse({ message: "ok", data: [mockTest], pagination })
    );
    const result = await getMockTestsByExam("e1");
    expect(result).toEqual({ ok: true, data: { data: [mockTest], pagination } });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/mock-tests/exam/e1",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("sends page, limit, search and subject filters", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: [], pagination })
    );
    await getMockTestsByExam("e/1", {
      page: 2,
      limit: 5,
      search: "anti nym",
      subjectId: "s1",
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/mock-tests/exam/e%2F1?page=2&limit=5&search=anti+nym&subjectId=s1",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns API errors", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "Exam not found" }, 404)
    );
    expect(await getMockTestsByExam("x")).toEqual({
      ok: false,
      status: 404,
      message: "Exam not found",
    });
  });

  it("fails on malformed payloads and network errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: [mockTest] }));
    const malformed = await getMockTestsByExam("e1");
    expect(malformed.ok).toBe(false);
    if (!malformed.ok) {
      expect(malformed.message).toMatch(/chapter-wise/i);
    }

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const offline = await getMockTestsByExam("e1");
    expect(offline.ok).toBe(false);
    if (!offline.ok) {
      expect(offline.status).toBeUndefined();
    }
  });
});
