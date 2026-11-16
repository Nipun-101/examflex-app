import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as AttemptsApi from "@/lib/api/attempts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttemptPageClient } from "@/components/attempt/attempt-page-client";
import { getAttempt, submitAttempt } from "@/lib/api/attempts";
import { readAttemptLanguage } from "@/lib/mocks/attempt-language";
import { cacheAttempt, readCachedAttempt } from "@/lib/mocks/attempt-storage";
import { makeDetails, makeMockTestData, makeStartData } from "@/test-utils/attempt-fixtures";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";
import type { AttemptDetails } from "@/types/attempt";

const replace = vi.fn();
const push = vi.fn();

const router = { replace, push };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));
vi.mock("mathpix-markdown-it", () => mathpixModuleStub());
vi.mock("@/lib/api/attempts", async (importOriginal) => {
  const actual = await importOriginal<typeof AttemptsApi>();
  return {
    ...actual,
    getAttempt: vi.fn(),
    patchAttemptAnswer: vi.fn(),
    pauseAttempt: vi.fn(),
    resumeAttempt: vi.fn(),
    submitAttempt: vi.fn(),
    completeSession: vi.fn(),
    pauseAttemptKeepalive: vi.fn(),
  };
});

const getAttemptMock = vi.mocked(getAttempt);
const submitMock = vi.mocked(submitAttempt);

/** A paper that started just now, so the computed clock is not already at zero. */
function freshStart() {
  return makeStartData({
    mockTestData: makeMockTestData({ startedAt: new Date().toISOString() }),
  });
}

function inProgress(overrides: Partial<AttemptDetails> = {}): AttemptDetails {
  const { score, submittedAt, correctAnswers, incorrectAnswers, unansweredQuestions, isPassed, timeTaken, ...rest } =
    makeDetails();
  void score; void submittedAt; void correctAnswers; void incorrectAnswers; void unansweredQuestions; void isPassed; void timeTaken;
  return { ...rest, status: "IN_PROGRESS", timeRemaining: 1800, timeElapsed: 100, ...overrides };
}

beforeEach(() => {
  replace.mockClear();
  push.mockClear();
  getAttemptMock.mockReset();
  submitMock.mockReset();
  submitMock.mockReturnValue(new Promise(() => undefined));
  sessionStorage.clear();
});

describe("AttemptPageClient", () => {
  it("blocks with the study loader while loading", () => {
    getAttemptMock.mockReturnValue(new Promise(() => undefined));
    render(<AttemptPageClient attemptId="att1" />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Loading your test...")).toBeInTheDocument();
  });

  it("starts the runner with the server clock", async () => {
    getAttemptMock.mockResolvedValue({ ok: true, data: inProgress() });
    render(<AttemptPageClient attemptId="att1" />);
    expect(await screen.findByRole("timer")).toHaveAttribute("aria-label", "Time left 30:00");
    expect(screen.queryByRole("dialog", { name: "Test Paused" })).not.toBeInTheDocument();
    expect(getAttemptMock).toHaveBeenCalledWith("att1");
  });

  it("falls back to the computed clock when the server omits it", async () => {
    const details = inProgress({
      test: makeMockTestData({ startedAt: new Date().toISOString() }),
    });
    delete details.timeRemaining;
    getAttemptMock.mockResolvedValue({ ok: true, data: details });
    render(<AttemptPageClient attemptId="att1" />);
    expect(await screen.findByRole("timer")).toHaveAttribute("aria-label", expect.stringMatching(/^Time left (1:00:00|59:\d\d)$/));
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("opens a paused attempt on the pause overlay", async () => {
    getAttemptMock.mockResolvedValue({ ok: true, data: inProgress({ status: "PAUSED" }) });
    render(<AttemptPageClient attemptId="att1" />);
    expect(await screen.findByRole("dialog", { name: "Test Paused" })).toBeInTheDocument();
  });

  it("redirects finished attempts to results and drops the cache", async () => {
    cacheAttempt(makeStartData());
    getAttemptMock.mockResolvedValue({ ok: true, data: makeDetails({ status: "SUBMITTED" }) });
    render(<AttemptPageClient attemptId="att1" />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/mocks/attempt/att1/result"));
    expect(readCachedAttempt("att1")).toBeNull();
    expect(screen.getByText("Opening your results...")).toBeInTheDocument();
  });

  it("redirects expired attempts too", async () => {
    getAttemptMock.mockResolvedValue({ ok: true, data: makeDetails({ status: "EXPIRED" }) });
    render(<AttemptPageClient attemptId="att1" />);
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  });

  it("rescues a network failure with the launch cache", async () => {
    cacheAttempt(freshStart());
    getAttemptMock.mockResolvedValue({ ok: false, message: "offline" });
    render(<AttemptPageClient attemptId="att1" />);
    expect(await screen.findByRole("timer")).toBeInTheDocument();
  });

  it("shows an error on a network failure without a cache", async () => {
    getAttemptMock.mockResolvedValue({ ok: false, message: "offline" });
    render(<AttemptPageClient attemptId="att1" />);
    expect(await screen.findByRole("heading", { name: "Attempt unavailable" })).toBeInTheDocument();
    expect(screen.getByText("offline")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Mocks" })).toHaveAttribute("href", "/mocks");
  });

  it("never uses the cache for HTTP errors", async () => {
    cacheAttempt(makeStartData());
    getAttemptMock.mockResolvedValue({ ok: false, message: "Not found", status: 404 });
    render(<AttemptPageClient attemptId="att1" />);
    expect(await screen.findByText("Not found")).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("retries after an error", async () => {
    getAttemptMock
      .mockResolvedValueOnce({ ok: false, message: "offline" })
      .mockResolvedValueOnce({ ok: true, data: inProgress() });
    render(<AttemptPageClient attemptId="att1" />);
    await userEvent.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("timer")).toBeInTheDocument();
    expect(getAttemptMock).toHaveBeenCalledTimes(2);
  });

  it("stops updating after unmount", async () => {
    let resolve: (value: Awaited<ReturnType<typeof getAttempt>>) => void = () => undefined;
    getAttemptMock.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { unmount } = render(<AttemptPageClient attemptId="att1" />);
    unmount();
    resolve({ ok: true, data: makeDetails({ status: "SUBMITTED" }) });
    await Promise.resolve();
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends the student to results with their language after submit", async () => {
    submitMock.mockResolvedValue({
      ok: true,
      data: {
        attemptId: "att1", score: 0, totalScore: 12, passingScore: null, passed: false,
        correctAnswers: 0, incorrectAnswers: 0, unansweredQuestions: 3,
        submittedAt: "", timeTaken: 0, questionResults: [],
      },
    });
    getAttemptMock.mockResolvedValue({ ok: true, data: inProgress() });
    render(<AttemptPageClient attemptId="att1" />);
    await screen.findByRole("timer");

    await userEvent.click(screen.getByRole("radio", { name: "മലയാളം" }));
    await userEvent.click(screen.getAllByRole("button", { name: "Submit Test" })[0] as HTMLElement);
    await userEvent.click(screen.getAllByRole("button", { name: "Submit Test" }).at(-1) as HTMLElement);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/mocks/attempt/att1/result"));
    expect(readAttemptLanguage("att1")).toBe("ml");
  });
});
