import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/equation-book/equation-book-client", () => ({
  EquationBookClient: () => (
    <div>
      <h1>Equation Book</h1>
      <p>A few cards. A clearer head.</p>
    </div>
  ),
}));

import EquationBookPage from "@/app/(app)/(study)/equation-book/page";

describe("EquationBookPage", () => {
  it("renders the Equation Book client shell", () => {
    render(<EquationBookPage />);

    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("A few cards. A clearer head.")
    ).toBeInTheDocument();
  });
});
