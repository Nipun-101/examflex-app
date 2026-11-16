import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ExamPageProvider,
  useExamPage,
  useResolvedExamId,
} from "@/hooks/use-exam-page";
import type { ApiExamDetail } from "@/types/exam";

const getExamById = vi.fn();

vi.mock("@/lib/api/exams", () => ({
  getExamById: (id: string) => getExamById(id),
}));

const exam: ApiExamDetail = {
  id: "ex1",
  name: "NEET",
  isSessionWise: false,
  hasMultiLingualSupport: false,
  isActive: true,
};

function wrapper({ children }: { children: ReactNode }) {
  return <ExamPageProvider examId="ex1">{children}</ExamPageProvider>;
}

describe("useExamPage", () => {
  beforeEach(() => {
    getExamById.mockReset();
  });

  it("throws outside the provider", () => {
    expect(() => renderHook(() => useExamPage())).toThrow(
      /must be used within ExamPageProvider/
    );
  });

  it("fetches the exam once and shares it", async () => {
    getExamById.mockResolvedValue({ ok: true, data: exam });
    const { result } = renderHook(() => useExamPage(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.exam).toBeNull();
    expect(screen.getByText("Loading exam...")).toBeInTheDocument();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exam).toEqual(exam);
    expect(result.current.examId).toBe("ex1");
    expect(result.current.error).toBeNull();
    expect(getExamById).toHaveBeenCalledTimes(1);
    expect(getExamById).toHaveBeenCalledWith("ex1");
  });

  it("exposes errors and reloads", async () => {
    getExamById
      .mockResolvedValueOnce({ ok: false, message: "Could not load" })
      .mockResolvedValueOnce({ ok: true, data: exam });
    const { result } = renderHook(() => useExamPage(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe("Could not load"));
    expect(result.current.exam).toBeNull();

    act(() => result.current.reload());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.exam).toEqual(exam));
    expect(getExamById).toHaveBeenCalledTimes(2);
  });

  it("useResolvedExamId prefers the prop over the provider", async () => {
    getExamById.mockResolvedValue({ ok: true, data: exam });
    const { result } = renderHook(() => useResolvedExamId("from-prop"), {
      wrapper,
    });
    expect(result.current).toBe("from-prop");
  });

  it("useResolvedExamId falls back to the provider id", async () => {
    getExamById.mockResolvedValue({ ok: true, data: exam });
    const { result } = renderHook(() => useResolvedExamId(), { wrapper });
    expect(result.current).toBe("ex1");
  });

  it("useResolvedExamId throws without a prop or provider", () => {
    expect(() => renderHook(() => useResolvedExamId())).toThrow(
      /examId prop or ExamPageProvider/
    );
  });

  it("ignores a response that arrives after unmount", async () => {
    let finish: (value: unknown) => void = () => {};
    getExamById.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const { unmount } = render(
      <ExamPageProvider examId="ex1">
        <p>child</p>
      </ExamPageProvider>
    );
    unmount();
    finish({ ok: true, data: exam });
    await Promise.resolve();
    expect(getExamById).toHaveBeenCalledTimes(1);
  });
});
