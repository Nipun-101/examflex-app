import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EquationBookPage from "@/app/(app)/equation-book/page";

describe("EquationBookPage", () => {
  it("renders the Equation Book study view", () => {
    render(<EquationBookPage />);

    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("A few cards. A clearer head.")
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Physics" })).toBeInTheDocument();
  });
});
