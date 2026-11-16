import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "@/hooks/use-countdown";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCountdown", () => {
  it("counts down once per second", () => {
    const { result } = renderHook(() =>
      useCountdown(10, { paused: false, onExpire: vi.fn() })
    );
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toBe(7);
  });

  it("stays deadline-based when the timer is throttled", () => {
    const { result } = renderHook(() =>
      useCountdown(120, { paused: false, onExpire: vi.fn() })
    );
    act(() => {
      vi.setSystemTime(Date.now() + 60_000);
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(59);
  });

  it("freezes while paused and continues from the frozen value", () => {
    const { result, rerender } = renderHook(
      ({ paused }) => useCountdown(10, { paused, onExpire: vi.fn() }),
      { initialProps: { paused: false } }
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender({ paused: true });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(8);

    rerender({ paused: false });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(7);
  });

  it("fires onExpire exactly once at zero", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useCountdown(2, { paused: false, onExpire })
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("does not expire while paused at zero", () => {
    const onExpire = vi.fn();
    renderHook(() => useCountdown(0, { paused: true, onExpire }));
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("clamps a negative start to zero", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useCountdown(-5, { paused: false, onExpire })
    );
    expect(result.current.secondsLeft).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("reset adopts a server value and re-arms expiry", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useCountdown(1, { paused: false, onExpire })
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reset(3);
    });
    expect(result.current.secondsLeft).toBe(3);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(2);
  });

  it("reset clamps negatives", () => {
    const { result } = renderHook(() =>
      useCountdown(5, { paused: true, onExpire: vi.fn() })
    );
    act(() => {
      result.current.reset(-3);
    });
    expect(result.current.secondsLeft).toBe(0);
  });

  it("calls the latest onExpire callback", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => useCountdown(1, { paused: false, onExpire: cb }),
      { initialProps: { cb: first } }
    );
    rerender({ cb: second });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
