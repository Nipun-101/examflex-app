import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAttemptGuards } from "@/hooks/use-attempt-guards";
import { pauseAttemptKeepalive } from "@/lib/api/attempts";
import { cacheAttempt, readCachedAttempt } from "@/lib/mocks/attempt-storage";
import type { StartAttemptData } from "@/types/attempt";

vi.mock("@/lib/api/attempts", () => ({
  pauseAttemptKeepalive: vi.fn(),
}));

const cached: StartAttemptData = {
  attemptId: "att1",
  mockTestData: {
    title: null,
    durationInMinutes: 1,
    totalQuestions: 0,
    startedAt: "",
    marksPerQuestion: null,
    negativeMarking: null,
    passingScore: null,
    exam: { id: "e", name: "NEET", description: "" },
  },
  questions: [],
};

function fire(type: string): Event {
  const event = new Event(type, { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  vi.mocked(pauseAttemptKeepalive).mockClear();
  sessionStorage.clear();
});

afterEach(() => {
  sessionStorage.clear();
});

describe("useAttemptGuards", () => {
  it("prompts on unload and keepalive-pauses on pagehide", () => {
    cacheAttempt(cached);
    renderHook(() => useAttemptGuards({ attemptId: "att1", onBackTrap: vi.fn() }));

    expect(fire("beforeunload").defaultPrevented).toBe(true);
    expect(pauseAttemptKeepalive).not.toHaveBeenCalled();

    fire("pagehide");
    expect(pauseAttemptKeepalive).toHaveBeenCalledWith("att1");
    expect(readCachedAttempt("att1")).toBeNull();
  });

  it("opens the leave dialog on back", () => {
    const onBackTrap = vi.fn();
    renderHook(() => useAttemptGuards({ attemptId: "att1", onBackTrap }));
    fire("popstate");
    expect(onBackTrap).toHaveBeenCalledTimes(1);
  });

  it("uses the latest back handler", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => useAttemptGuards({ attemptId: "att1", onBackTrap: cb }),
      { initialProps: { cb: first } }
    );
    rerender({ cb: second });
    fire("popstate");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("disarm stops every guard", () => {
    const onBackTrap = vi.fn();
    const { result } = renderHook(() =>
      useAttemptGuards({ attemptId: "att1", onBackTrap })
    );
    result.current.disarm();

    expect(fire("beforeunload").defaultPrevented).toBe(false);
    fire("pagehide");
    fire("popstate");
    expect(pauseAttemptKeepalive).not.toHaveBeenCalled();
    expect(onBackTrap).not.toHaveBeenCalled();
  });

  it("removes listeners on unmount", () => {
    const onBackTrap = vi.fn();
    const { unmount } = renderHook(() =>
      useAttemptGuards({ attemptId: "att1", onBackTrap })
    );
    unmount();
    expect(fire("beforeunload").defaultPrevented).toBe(false);
    fire("popstate");
    expect(onBackTrap).not.toHaveBeenCalled();
  });
});
