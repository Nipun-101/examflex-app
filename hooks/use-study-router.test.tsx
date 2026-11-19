import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  StudyLoadingProvider,
  useStudyLoadingOverlay,
} from "@/components/study/study-loading-provider";
import { useStudyRouter } from "@/hooks/use-study-router";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <StudyLoadingProvider>{children}</StudyLoadingProvider>;
}

describe("useStudyRouter", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
  });

  it("shows the overlay before push and replace", () => {
    const { result } = renderHook(
      () => ({
        router: useStudyRouter(),
        loading: useStudyLoadingOverlay(),
      }),
      { wrapper }
    );

    act(() => {
      result.current.router.push("/mocks", { label: "Opening mocks..." });
    });

    expect(push).toHaveBeenCalledWith("/mocks");
    expect(result.current.loading.isLoading).toBe(true);
    expect(result.current.loading.label).toBe("Opening mocks...");

    act(() => {
      result.current.router.replace("/analysis");
    });
    expect(replace).toHaveBeenCalledWith("/analysis");
    expect(result.current.loading.isLoading).toBe(true);
  });
});
