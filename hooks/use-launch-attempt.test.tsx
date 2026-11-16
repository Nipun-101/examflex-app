import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLaunchAttempt } from "@/hooks/use-launch-attempt";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";
import type { ApiResult } from "@/lib/api/parse-envelope";
import type { ResumeAttemptData, StartAttemptData } from "@/types/attempt";

const push = vi.fn();
const startMockTestAttempt = vi.fn();
const resumeAttempt = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/api/attempts", () => ({
  startMockTestAttempt: (id: string) => startMockTestAttempt(id),
  resumeAttempt: (id: string) => resumeAttempt(id),
}));

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

  it("resumes an in-progress attempt", async () => {
    resumeAttempt.mockResolvedValue({
      ok: true,
      data: { attemptId: "att9" } as ResumeAttemptData,
    });
    const { result } = renderHook(() => useLaunchAttempt(), { wrapper });

    await act(async () => {
      await result.current.resume("t1", "att9");
    });

    expect(resumeAttempt).toHaveBeenCalledWith("att9");
    expect(push).toHaveBeenCalledWith("/mocks/attempt/att9");
  });

  it("launch resumes when the paper has a resume attempt, otherwise starts", async () => {
    resumeAttempt.mockResolvedValue({
      ok: true,
      data: { attemptId: "att9" } as ResumeAttemptData,
    });
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
    expect(resumeAttempt).toHaveBeenCalledWith("att9");
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
