import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSprintTests,
  parseApiSprintTest,
  parseSprintTestsPage,
} from "@/lib/api/sprint-tests";

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

const sprint = {
  id: "sp1",
  title: "Sprint 1",
  description: null,
  totalQuestions: 30,
  durationInMinutes: 45,
  exam: { id: "e1", name: "NEET" },
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: null,
  allowRetake: false,
  shuffleOptions: true,
  showResultsImmediately: false,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  accessMode: "ENTITLED",
  access: { allowed: true, reason: "ENTITLED" },
  userAttemptAction: "RETAKE",
};

describe("parseApiSprintTest", () => {
  it("parses a sprint test", () => {
    expect(parseApiSprintTest(sprint)).toEqual(sprint);
  });

  it("allows a missing exam", () => {
    expect(parseApiSprintTest({ ...sprint, exam: undefined })).toMatchObject({
      exam: null,
    });
  });

  it("rejects invalid sprints", () => {
    expect(parseApiSprintTest(null)).toBeNull();
    expect(parseApiSprintTest({ ...sprint, totalQuestions: "30" })).toBeNull();
  });
});

describe("parseSprintTestsPage", () => {
  it("parses a page and rejects malformed envelopes", () => {
    expect(
      parseSprintTestsPage({ data: [sprint, "x"], pagination })
    ).toEqual({ data: [sprint], pagination });
    expect(parseSprintTestsPage({ pagination })).toBeNull();
  });
});

describe("getSprintTests", () => {
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

  it("fetches sprint tests for an exam", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: [sprint], pagination })
    );
    const result = await getSprintTests({ examId: "e1" });
    expect(result).toEqual({ ok: true, data: { data: [sprint], pagination } });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/sprint-tests?examId=e1",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("sends pagination params", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: [], pagination })
    );
    await getSprintTests({ examId: "e1", page: 2, limit: 5 });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/sprint-tests?examId=e1&page=2&limit=5",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns API, malformed and network failures", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Bad request" }, 400)
    );
    expect(await getSprintTests({ examId: "" })).toEqual({
      ok: false,
      status: 400,
      message: "Bad request",
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: [] }));
    expect((await getSprintTests({ examId: "e1" })).ok).toBe(false);

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    expect((await getSprintTests({ examId: "e1" })).ok).toBe(false);
  });
});
