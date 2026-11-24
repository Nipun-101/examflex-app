import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLaunchAttempt } from "@/hooks/use-launch-attempt";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";
import type { ApiResult } from "@/lib/api/parse-envelope";
import type { AttemptDetails, StartAttemptData } from "@/types/attempt";

const push = vi.fn();
const startMockTestAttempt = vi.fn();
const resumeAttempt = vi.fn();
const getAttempt = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/mocks",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/attempts", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "@/lib/api/attempts"
  );
  return {
    ...actual,
    startMockTestAttempt: (id: string) => startMockTestAttempt(id),
    resumeAttempt: (id: string) => resumeAttempt(id),
    getAttempt: (id: string) => getAttempt(id),
  };
});

function details(
  status: string,
  attemptId = "att9"
): ApiResult<AttemptDetails> {
  return {
    ok: true,
    data: {
      attemptId,
      status,
      timeRemaining: 300,
      timeElapsed: 60,
      test: {
        title: "Paper",
        durationInMinutes: 6,
        totalQuestions: 1,
        startedAt: "2026-01-01T00:00:00.000Z",
        marksPerQuestion: 4,
        negativeMarking: 1,
        passingScore: null,
        exam: { id: "ex1", name: "Exam", description: "" },
      },
      questions: [],
    },
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <StudyLoadingProvider>{children}</StudyLoadingProvider>;
}

function started(attemptId: string): ApiResult<StartAttemptData> {
  return {
    ok: true,
    data: { attemptId } as StartAttemptData,
  };
}

describe("useLaunchAttempt", () => {
  beforeEach(() => {
    push.mockReset();
    startMockTestAttempt.mockReset();
    resumeAttempt.mockReset();
    getAttempt.mockReset();
    sessionStorage.clear();
  });

  it("starts a paper and opens the attempt", async () => {
    startMockTestAttempt.mockResolvedValue(started("att1"));
    const { result } = renderHook(() => useLaunchAttempt(), { wrapper });

    await act(async () => {
      await result.current.start("t1");
    });

    expect(startMockTestAttempt).toHaveBeenCalledWith("t1");
    expect(push).toHaveBeenCalledWith("/mocks/attempt/att1");
    expect(result.current.startError).toBeNull();
    // Soft Nav can keep the list mounted — release so CTAs are not stuck.
    expect(result.current.startingTestId).toBeNull();
  });

  it("resumes a paused attempt via the attempt page, not from the list", async () => {
    getAttempt.mockResolvedValue(details("PAUSED"));
    const { result } = renderHook(() => useLaunchAttempt(), { wrapper });

    await act(async () => {
      await result.current.resume("t1", "att9");
    });

    expect(getAttempt).toHaveBeenCalledWith("att9");
    expect(resumeAttempt).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/mocks/attempt/att9");
    expect(
      sessionStorage.getItem("examflex:mockAttemptAutoResume:att9")
    ).toBe("1");
  });

  it("opens a running attempt directly and caches it for offline rescue", async () => {
    getAttempt.mockResolvedValue(details("IN_PROGRESS"));
    const { result } = renderHook(() => useLaunchAttempt(), { wrapper });

    await act(async () => {
      await result.current.resume("t1", "att9");
    });

    expect(push).toHaveBeenCalledWith("/mocks/attempt/att9");
    expect(
      sessionStorage.getItem("examflex:mockAttemptAutoResume:att9")
    ).toBeNull();
    const cached = JSON.parse(
      sessionStorage.getItem("examflex:mockAttempt:att9") ?? "null"
    );
    expect(cached).toMatchObject({ attemptId: "att9", timeRemaining: 300 });
  });

  it.each([
    ["EXPIRED", "ATTEMPT_EXPIRED", "Time ran out on this attempt"],
    ["SUBMITTED", "ATTEMPT_CLOSED", "already submitted"],
  ])(
    "reports a %s attempt as stale instead of opening it",
    async (status, code, copy) => {
      getAttempt.mockResolvedValue(details(status));
      const onStaleAttempt = vi.fn();
      const { result } = renderHook(
        () => useLaunchAttempt({ onStaleAttempt }),
        { wrapper }
      );

      await act(async () => {
        await result.current.resume("t1", "att9");
      });

      expect(push).not.toHaveBeenCalled();
      expect(onStaleAttempt).toHaveBeenCalledWith("t1");
      expect(result.current.startError?.code).toBe(code);
      expect(result.current.startError?.message).toContain(copy);
      expect(result.current.startingTestId).toBeNull();
    }
  );

  it("reports stale start errors so the list can reload", async () => {
    startMockTestAttempt.mockResolvedValue({
      ok: false,
      status: 409,
      message: "server",
      code: "ATTEMPT_ALREADY_ACTIVE",
    });
    const onStaleAttempt = vi.fn();
    const { result } = renderHook(() => useLaunchAttempt({ onStaleAttempt }), {
      wrapper,
    });

    await act(async () => {
      await result.current.start("t1");
    });

    expect(onStaleAttempt).toHaveBeenCalledWith("t1");
    expect(result.current.startError).toEqual({
      message: "You already have this test in progress. Resume it to carry on.",
      code: "ATTEMPT_ALREADY_ACTIVE",
    });
  });

  it("does not reload the list for unrelated errors", async () => {
    getAttempt.mockResolvedValue({ ok: false, message: "offline" });
    const onStaleAttempt = vi.fn();
    const { result } = renderHook(() => useLaunchAttempt({ onStaleAttempt }), {
      wrapper,
    });

    await act(async () => {
      await result.current.resume("t1", "att9");
    });

    expect(onStaleAttempt).not.toHaveBeenCalled();
    expect(result.current.startError).toEqual({ message: "offline" });
  });

  it("launch resumes when the paper has a resume attempt, otherwise starts", async () => {
    getAttempt.mockResolvedValue(details("IN_PROGRESS"));
    const { result, unmount } = renderHook(() => useLaunchAttempt(), {
      wrapper,
    });
    await act(async () => {
      await result.current.launch({
        id: "t1",
        userAttemptAction: "RESUME",
        resumeAttemptId: "att9",
      });
    });
    expect(getAttempt).toHaveBeenCalledWith("att9");
    expect(startMockTestAttempt).not.toHaveBeenCalled();
    unmount();

    startMockTestAttempt.mockResolvedValue(started("att2"));
    const next = renderHook(() => useLaunchAttempt(), { wrapper });
    await act(async () => {
      await next.result.current.launch({ id: "t2", userAttemptAction: "RETAKE" });
    });
    expect(startMockTestAttempt).toHaveBeenCalledWith("t2");
  });

  it("ignores a second launch while one is running", async () => {
    let finish: (value: ApiResult<StartAttemptData>) => void = () => {};
    startMockTestAttempt.mockReturnValue(
      new Promise<ApiResult<StartAttemptData>>((resolve) => {
        finish = resolve;
      })
    );
    const { result } = renderHook(() => useLaunchAttempt(), { wrapper });

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.start("t1");
    });
    await waitFor(() => expect(result.current.startingTestId).toBe("t1"));

    await act(async () => {
      await result.current.start("t2");
    });
    expect(startMockTestAttempt).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish(started("att1"));
      await first;
    });
    expect(push).toHaveBeenCalledTimes(1);
    expect(result.current.startingTestId).toBeNull();
  });

  it("shows the entitlement message and releases the lock on failure", async () => {
    startMockTestAttempt.mockResolvedValueOnce({
      ok: false,
      status: 403,
      message: "server",
      code: "ENTITLEMENT_REQUIRED",
    });
    const { result } = renderHook(() => useLaunchAttempt(), { wrapper });

    await act(async () => {
      await result.current.start("t1");
    });

    expect(push).not.toHaveBeenCalled();
    expect(result.current.startingTestId).toBeNull();
    expect(result.current.startError).toEqual({
      message: "This test needs an active plan. View plans to unlock it.",
      code: "ENTITLEMENT_REQUIRED",
      testId: "t1",
    });

    startMockTestAttempt.mockResolvedValueOnce(started("att3"));
    await act(async () => {
      await result.current.start("t1");
    });
    expect(result.current.startError).toBeNull();
    expect(push).toHaveBeenCalledWith("/mocks/attempt/att3");
  });

  it("surfaces other errors and clears them", async () => {
    startMockTestAttempt.mockResolvedValue({ ok: false, message: "Boom" });
    const { result } = renderHook(() => useLaunchAttempt(), { wrapper });

    await act(async () => {
      await result.current.start("t1");
    });
    expect(result.current.startError).toEqual({ message: "Boom" });

    act(() => result.current.clearError());
    expect(result.current.startError).toBeNull();
  });
});
