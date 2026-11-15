import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MistakeReviewTimer } from "@/components/mistake-book/mistake-review-timer";

describe("MistakeReviewTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts, ticks, stops, and resets with the active card", () => {
    const { rerender } = render(
      <MistakeReviewTimer
        label="Review time · optional"
        hint="Track time"
        resetKey="mb-1"
      />
    );

    expect(screen.getByText("00:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("00:02")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("00:02")).toBeInTheDocument();

    rerender(
      <MistakeReviewTimer
        label="Review time · optional"
        hint="Track time"
        resetKey="mb-2"
      />
    );
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });
});
