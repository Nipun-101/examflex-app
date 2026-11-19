import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnalysisPerformanceCard } from "@/components/analysis/analysis-performance-card";

describe("AnalysisPerformanceCard", () => {
  it("renders the empty score and gauge", () => {
    render(
      <AnalysisPerformanceCard
        label="LATEST PERFORMANCE"
        score={null}
        maxScore={720}
        scoreHint="Appears after your first full mock · based on marks only"
      />
    );

    expect(screen.getByText("— / 720")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Score gauge empty/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("shows the score and supports editing when enabled", async () => {
    const user = userEvent.setup();
    const onScoreChange = vi.fn();

    render(
      <AnalysisPerformanceCard
        label="LATEST PERFORMANCE · MOCK 12"
        score={548}
        maxScore={720}
        scoreHint="Based on marks only"
        editEnabled
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
});
