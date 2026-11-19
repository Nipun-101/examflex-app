import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisScoreGauge } from "@/components/analysis/analysis-score-gauge";

describe("AnalysisScoreGauge", () => {
  it("labels empty and scored states", () => {
    const { rerender } = render(
      <AnalysisScoreGauge score={null} maxScore={720} />
    );
    expect(
      screen.getByRole("img", { name: /Score gauge empty, out of 720/i })
    ).toBeInTheDocument();

    rerender(<AnalysisScoreGauge score={548} maxScore={720} />);
    expect(
      screen.getByRole("img", { name: /Score 548 of 720/i })
    ).toBeInTheDocument();
  });
});
