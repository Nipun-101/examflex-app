import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationBookCard } from "@/components/study/equation-book-card";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("EquationBookCard", () => {
  it("links into the equation book placeholder route", () => {
    render(<EquationBookCard data={TODAY_PAGE_DATA.equationBook} />);

    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Review 8 due cards/i })
    ).toHaveAttribute("href", "/equation-book");
  });
});
