import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AnalysisLatestMockInsights } from "@/components/analysis/analysis-latest-mock-insights";
import { latestMockMetrics } from "@/lib/analysis/latest-mock-metrics";

const metrics = latestMockMetrics({
  attemptId: "a1",
  title: "Mock 1",
  score: 8,
  maxScore: 720,
  percent: 1,
  submittedAt: "2026-01-01T00:00:00Z",
  deltaFromPrevious: null,
  correctCount: 6,
  incorrectCount: 16,
  skippedCount: 158,
  marksPerCorrect: 4,
  negativeMarking: 1,
  durationInMinutes: 180,
  timeTakenSeconds: 462,
})!;

describe("AnalysisLatestMockInsights", () => {
  it("starts on accuracy and switches with the chips", async () => {
    const user = userEvent.setup();
    render(<AnalysisLatestMockInsights label="LATEST" metrics={metrics} />);

    expect(screen.getByText("27%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Marks" }));
    expect(screen.getByText("632")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Time" }));
    expect(screen.getByText("8 min")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next goal" }));
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next goal" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
