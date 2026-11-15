import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnalysisPage from "@/app/(app)/analysis/page";

describe("AnalysisPage", () => {
  it("renders the analysis placeholder", () => {
    render(<AnalysisPage />);

    expect(
      screen.getByRole("heading", { name: "Analysis" })
    ).toBeInTheDocument();
  });
});
