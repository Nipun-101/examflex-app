import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisDisclaimerCard } from "@/components/analysis/analysis-disclaimer";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

describe("AnalysisDisclaimerCard", () => {
  it("renders the how-to-read copy", () => {
    render(
      <AnalysisDisclaimerCard disclaimer={ANALYSIS_PAGE_DATA.disclaimer} />
    );

    expect(screen.getByText("HOW TO READ THIS")).toBeInTheDocument();
    expect(
      screen.getByText(/All calculations are based entirely on marks only/i)
    ).toBeInTheDocument();
  });
});
