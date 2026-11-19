import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationBookCard } from "@/components/study/equation-book-card";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("EquationBookCard", () => {
  it("links into the equation book route with creative promo copy", () => {
    render(<EquationBookCard data={TODAY_PAGE_DATA.equationBook} />);

    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Equation Book/i })
    ).toHaveAttribute("href", "/equation-book");
    expect(screen.getByText(/Flip a card/i)).toBeInTheDocument();
    expect(screen.getByText("F = ?")).toBeInTheDocument();
  });

  it("does not claim due-card tracking on the empty seed", () => {
    render(<EquationBookCard data={TODAY_EMPTY_SEED.equationBook} />);

    expect(screen.queryByText(/0 due cards/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Flip a card/i)).toBeInTheDocument();
  });
});
