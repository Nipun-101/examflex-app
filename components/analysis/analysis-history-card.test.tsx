import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisHistoryCard } from "@/components/analysis/analysis-history-card";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

describe("AnalysisHistoryCard", () => {
  it("shows unlock overlay when locked", () => {
    const fullMocks = ANALYSIS_PAGE_DATA.overview!.fullMocks;
    render(
      <AnalysisHistoryCard
        examId="exam-neet"
        fullMocks={fullMocks}
        locked
      />
    );

    expect(
      screen.getByRole("heading", { name: /Unlock your full-mock trend/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Attempt a full mock/i })
    ).toHaveAttribute("href", "/mocks/exam/exam-neet/full-mocks");
  });

  it("routes illustrative exam id to mocks home", () => {
    const fullMocks = ANALYSIS_PAGE_DATA.overview!.fullMocks;
    render(
      <AnalysisHistoryCard
        examId="illustrative"
        fullMocks={fullMocks}
        locked
      />
    );
    expect(
      screen.getByRole("link", { name: /Attempt a full mock/i })
    ).toHaveAttribute("href", "/mocks");
  });
});
