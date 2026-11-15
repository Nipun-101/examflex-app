import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnalysisPerformanceCard } from "@/components/analysis/analysis-performance-card";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

describe("AnalysisPerformanceCard", () => {
  it("shows the score and supports editing", async () => {
    const user = userEvent.setup();
    const onScoreChange = vi.fn();

    render(
      <AnalysisPerformanceCard
        performance={ANALYSIS_PAGE_DATA.performance}
        score={548}
        onScoreChange={onScoreChange}
      />
    );

    expect(screen.getByText("548 / 720")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = screen.getByLabelText(/Edit score out of 720/i);
    await user.clear(input);
    await user.type(input, "600");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onScoreChange).toHaveBeenCalledWith(600);
  });

  it("falls back to the current score when the draft is invalid", async () => {
    const user = userEvent.setup();
    const onScoreChange = vi.fn();

    render(
      <AnalysisPerformanceCard
        performance={ANALYSIS_PAGE_DATA.performance}
        score={548}
        onScoreChange={onScoreChange}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const input = screen.getByLabelText(/Edit score out of 720/i);
    await user.clear(input);
    await user.type(input, "abc");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onScoreChange).toHaveBeenCalledWith(548);
  });
});
