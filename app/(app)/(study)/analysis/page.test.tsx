import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AnalysisPage from "@/app/(app)/(study)/analysis/page";

vi.mock("@/components/analysis/analysis-page-client", () => ({
  AnalysisPageClient: () => (
    <div>
      <h1>Your possibilities</h1>
    </div>
  ),
}));

describe("AnalysisPage", () => {
  it("renders the Analysis client shell", () => {
    render(<AnalysisPage />);
    expect(
      screen.getByRole("heading", { name: "Your possibilities" })
    ).toBeInTheDocument();
  });
});
