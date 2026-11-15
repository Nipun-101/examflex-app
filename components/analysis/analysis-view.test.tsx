import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AnalysisView } from "@/components/analysis/analysis-view";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

describe("AnalysisView", () => {
  it("renders the possibilities outlook", () => {
    const { container } = render(<AnalysisView data={ANALYSIS_PAGE_DATA} />);

    expect(
      screen.getByRole("heading", { name: "Your possibilities" })
    ).toBeInTheDocument();
    expect(screen.getByText("548 / 720")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What this level could open up" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "MBBS" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Check official counselling cutoffs/i,
      })
    ).toHaveAttribute("href", ANALYSIS_PAGE_DATA.cutoffHref);

    const cutoffLink = screen.getByRole("link", {
      name: /Check official counselling cutoffs/i,
    });
    const disclaimer = screen.getByText("HOW TO READ THIS");
    expect(
      Boolean(
        cutoffLink.compareDocumentPosition(disclaimer) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);
    expect(container.querySelector(".lg\\:items-end")).toBeInTheDocument();
  });

  it("updates the performance score from Edit", async () => {
    const user = userEvent.setup();
    render(<AnalysisView data={ANALYSIS_PAGE_DATA} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const input = screen.getByLabelText(/Edit score out of 720/i);
    await user.clear(input);
    await user.type(input, "610");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("610 / 720")).toBeInTheDocument();
  });
});
