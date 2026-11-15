import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisPathwayCard } from "@/components/analysis/analysis-pathway-card";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

describe("AnalysisPathwayCard", () => {
  it("renders stretch and explore tones", () => {
    const stretch = ANALYSIS_PAGE_DATA.pathways[0]!;
    const explore = ANALYSIS_PAGE_DATA.pathways[1]!;

    const { rerender } = render(<AnalysisPathwayCard pathway={stretch} />);
    expect(
      screen.getByRole("heading", { name: stretch.title })
    ).toBeInTheDocument();
    expect(screen.getByText(stretch.badge)).toHaveClass("bg-study-mint");

    rerender(<AnalysisPathwayCard pathway={explore} />);
    expect(screen.getByText(explore.badge)).toHaveClass("bg-study-lilac");
  });
});
