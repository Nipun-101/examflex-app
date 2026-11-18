import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationProgress } from "@/components/equation-book/equation-progress";

describe("EquationProgress", () => {
  it("shows chapter progress copy and bar value", () => {
    render(
      <EquationProgress
        chapterLabel="Laws of motion"
        current={3}
        total={8}
        percent={38}
      />
    );

    expect(screen.getByText("Laws of motion")).toBeInTheDocument();
    expect(screen.getByText("3 of 8 equations")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "38"
    );
  });

  it("lets long chapter labels wrap instead of forcing overflow", () => {
    render(
      <EquationProgress
        chapterLabel="Some Basic Principles of Organic Chemistry"
        current={1}
        total={1}
        percent={100}
      />
    );

    const label = screen.getByText(
      "Some Basic Principles of Organic Chemistry"
    );
    expect(label).toHaveClass("min-w-0", "break-words");
    expect(screen.getByText("1 of 1 equations")).toHaveClass("shrink-0");
  });
});
