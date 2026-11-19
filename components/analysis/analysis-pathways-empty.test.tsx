import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisPathwaysEmpty } from "@/components/analysis/analysis-pathways-empty";

describe("AnalysisPathwaysEmpty", () => {
  it("renders the available-soon empty state", () => {
    render(<AnalysisPathwaysEmpty />);

    expect(
      screen.getByRole("heading", { name: /Pathway outlook available soon/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Course pathways for this exam will show up here/i)
    ).toBeInTheDocument();
  });
});
