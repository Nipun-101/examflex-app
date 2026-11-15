import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStudyLoading } from "@/hooks/use-study-loading";
import { STUDY_LOADING_DEFAULT_LABEL } from "@/lib/study/loading";

describe("useStudyLoading", () => {
  it("toggles visibility and label", () => {
    const { result } = renderHook(() => useStudyLoading());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.label).toBe(STUDY_LOADING_DEFAULT_LABEL);

    act(() => {
      result.current.show({ label: "Uploading" });
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.label).toBe("Uploading");

    act(() => {
      result.current.hide();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("runs an async action under the loader and always hides", async () => {
    const { result } = renderHook(() => useStudyLoading());

    let resolveAction: ((value: string) => void) | undefined;
    const action = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = resolve;
        })
    );

    let runPromise: Promise<string>;
    act(() => {
      runPromise = result.current.run(action, { label: "Calling API" });
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.label).toBe("Calling API");

    await act(async () => {
      resolveAction?.("ok");
      await expect(runPromise!).resolves.toBe("ok");
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("hides after a rejected action", async () => {
    const { result } = renderHook(() => useStudyLoading());

    await act(async () => {
      await expect(
        result.current.run(async () => {
          throw new Error("failed");
        })
      ).rejects.toThrow("failed");
    });

    expect(result.current.isLoading).toBe(false);
  });
});
