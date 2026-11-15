import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationRecallCard } from "@/components/equation-book/equation-recall-card";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";

describe("EquationRecallCard", () => {
  it("renders the incline recall card copy", () => {
    const card = EQUATION_BOOK_DATA.cards.find((item) =>
      item.promptTitle.includes("rough incline")
    );

    expect(card).toBeDefined();
    render(<EquationRecallCard card={card!} />);

    expect(
      screen.getByRole("heading", { name: /rough incline/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/ANSWER REVEALED/i)).toBeInTheDocument();
    expect(screen.getByText(/sin θ/)).toBeInTheDocument();
  });
});
