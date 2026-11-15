import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EquationBookPage from "@/app/(app)/equation-book/page";

describe("EquationBookPage", () => {
  it("renders the equation book placeholder", () => {
    render(<EquationBookPage />);

    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
  });
});
