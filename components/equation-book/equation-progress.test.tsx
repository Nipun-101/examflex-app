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
});
