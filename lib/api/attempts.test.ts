import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeSession,
  getAttempt,
  patchAttemptAnswer,
  pauseAttempt,
  pauseAttemptKeepalive,
  resumeAttempt,
  startMockTestAttempt,
  submitAttempt,
} from "@/lib/api/attempts";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

const question = {
  _id: "q1",
  questionText: {
    en: { text: "What?", imageUrl: null },
    ml: { text: "", imageUrl: null },
  },
  options: [{ id: "a", type: "text", en: "A", ml: "", imageUrl: null }],
  subject: "s1",
};

const mockTestData = {
  title: "Kinematics",
  durationInMinutes: 30,
  totalQuestions: 1,
  startedAt: "2026-01-01T00:00:00.000Z",
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: null,
  exam: { id: "e1", name: "NEET", description: "" },
};

const start = { attemptId: "a1", mockTestData, questions: [question] };

const submitResult = {
  attemptId: "a1",
  score: 4,
  totalScore: 4,
  passingScore: null,
  passed: false,
  correctAnswers: 1,
  incorrectAnswers: 0,
  unansweredQuestions: 0,
  submittedAt: "2026-01-01T00:30:00.000Z",
  timeTaken: 600,
  questionResults: [],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function lastRequest(): { url: string; init: RequestInit } {
  const call = vi.mocked(fetch).mock.calls.at(-1);
  if (!call) throw new Error("fetch not called");
  return { url: String(call[0]), init: call[1] ?? {} };
}

describe("attempts API", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts an attempt", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "ok", data: start }));
    const result = await startMockTestAttempt("m1");
    expect(result).toEqual({ ok: true, data: start });
    const { url, init } = lastRequest();
    expect(url).toBe("http://localhost:3000/api/v1/mock-test-attempts/start");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ mockTestId: "m1" }));
  });

  it("surfaces start failures such as denied access", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Access denied" }, 403)
    );
    expect(await startMockTestAttempt("m1")).toEqual({
      ok: false,
      status: 403,
      message: "Access denied",
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: { x: 1 } }));
    const malformed = await startMockTestAttempt("m1");
    expect(malformed.ok).toBe(false);
    if (!malformed.ok) expect(malformed.message).toMatch(/start this test/i);
  });

  it("patches an answer, including clearing it", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "saved" }));
    expect(await patchAttemptAnswer("a 1", "q1", "a")).toEqual({
      ok: true,
      data: undefined,
    });
    let request = lastRequest();
    expect(request.url).toBe(
      "http://localhost:3000/api/v1/mock-test-attempts/a%201/answer"
    );
    expect(request.init.method).toBe("PATCH");
    expect(request.init.body).toBe(
      JSON.stringify({ questionId: "q1", selectedOptionId: "a" })
    );

    await patchAttemptAnswer("a1", "q1", null);
    request = lastRequest();
    expect(request.init.body).toBe(
      JSON.stringify({ questionId: "q1", selectedOptionId: null })
    );
  });

  it("reports patch failures and network errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Time is up" }, 400)
    );
    expect(await patchAttemptAnswer("a1", "q1", "a")).toEqual({
      ok: false,
      status: 400,
      message: "Time is up",
    });

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const offline = await patchAttemptAnswer("a1", "q1", "a");
    expect(offline.ok).toBe(false);
  });

  it("pauses an attempt", async () => {
    const pause = {
      attemptId: "a1",
      testTitle: "Kinematics",
      status: "PAUSED",
      timeConsumed: 10,
      timeRemaining: 590,
      pausedAt: "2026-01-01T00:10:00.000Z",
      pauseCount: 1,
    };
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "ok", data: pause }));
    expect(await pauseAttempt("a1")).toEqual({ ok: true, data: pause });
    const { url, init } = lastRequest();
    expect(url).toBe("http://localhost:3000/api/v1/mock-test-attempts/a1/pause");
    expect(init.method).toBe("POST");

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: null }));
    expect((await pauseAttempt("a1")).ok).toBe(false);
  });

  it("resumes an attempt", async () => {
    const resume = { ...start, timeElapsed: 10, timeRemaining: 590 };
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "ok", data: resume }));
    expect(await resumeAttempt("a1")).toEqual({ ok: true, data: resume });
    const { url, init } = lastRequest();
    expect(url).toBe("http://localhost:3000/api/v1/mock-test-attempts/a1/resume");
    expect(init.method).toBe("GET");

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: "gone" }, 404));
    expect(await resumeAttempt("a1")).toEqual({
      ok: false,
      status: 404,
      message: "gone",
    });
  });

  it("submits answers", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: submitResult })
    );
    const answers = [{ questionId: "q1", selectedOptionId: "a" }];
    expect(await submitAttempt("a1", answers)).toEqual({
      ok: true,
      data: submitResult,
    });
    const { url, init } = lastRequest();
    expect(url).toBe("http://localhost:3000/api/v1/mock-test-attempts/a1/submit");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ answers }));

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: {} }));
    expect((await submitAttempt("a1", [])).ok).toBe(false);
  });

  it("completes a session", async () => {
    const complete = {
      paperCompleted: true,
      sessions: [],
      currentSessionIndex: 0,
      results: submitResult,
    };
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: complete })
    );
    expect(await completeSession("a1")).toEqual({ ok: true, data: complete });
    const { url, init } = lastRequest();
    expect(url).toBe(
      "http://localhost:3000/api/v1/mock-test-attempts/a1/sessions/complete"
    );
    expect(init.method).toBe("POST");

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Not session-wise" }, 400)
    );
    expect((await completeSession("a1")).ok).toBe(false);
  });

  it("loads attempt details", async () => {
    const details = {
      attemptId: "a1",
      status: "IN_PROGRESS",
      test: mockTestData,
      questions: [question],
    };
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "ok", data: details }));
    expect(await getAttempt("a1")).toEqual({ ok: true, data: details });
    const { url, init } = lastRequest();
    expect(url).toBe("http://localhost:3000/api/v1/mock-test-attempts/a1");
    expect(init.method).toBe("GET");

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const offline = await getAttempt("a1");
    expect(offline.ok).toBe(false);
    if (!offline.ok) expect(offline.message).toMatch(/reach ExamFlex/i);
  });

  it("fires a keepalive pause and swallows transport failures", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "ok" }));
    pauseAttemptKeepalive("a1");
    const { url, init } = lastRequest();
    expect(url).toBe("http://localhost:3000/api/v1/mock-test-attempts/a1/pause");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    expect(() => pauseAttemptKeepalive("a1")).not.toThrow();
    await Promise.resolve();
  });
});
