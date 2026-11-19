import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("shows the score without an edit control", () => {
    render(
      <AnalysisPerformanceCard
        label="LATEST PERFORMANCE · MOCK 12"
        score={548}
        maxScore={720}
        scoreHint="Based on marks from your latest full mock"
      />
    );

    expect(screen.getByText("548 / 720")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });
});
