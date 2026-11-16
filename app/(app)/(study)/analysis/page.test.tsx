import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnalysisPage from "@/app/(app)/(study)/analysis/page";

describe("AnalysisPage", () => {
  it("renders the Analysis possibilities experience", () => {
    render(<AnalysisPage />);

    expect(
      screen.getByRole("heading", { name: "Your possibilities" })
    ).toBeInTheDocument();
    expect(screen.getByText("548 / 720")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "MBBS" })).toBeInTheDocument();
  });
});
