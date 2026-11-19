import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationEmptyState } from "@/components/equation-book/equation-empty-state";
import { EQUATION_BOOK_COPY } from "@/types/equation-book";

describe("EquationEmptyState", () => {
  it("renders the three empty-state cards with catalog-aligned copy", () => {
    render(<EquationEmptyState chapterLabel="Laws of motion" />);

    expect(
      screen.getByRole("heading", { name: EQUATION_BOOK_COPY.emptyTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(EQUATION_BOOK_COPY.emptyBody)).toBeInTheDocument();
    expect(screen.getByText(/RECALL SESSION/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Laws of motion" })
    ).toBeInTheDocument();
    expect(screen.getByText(/IN THIS CHAPTER/i)).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(
      screen.queryByText(/questions you miss/i)
    ).not.toBeInTheDocument();
  });

  it("always offers browse-all when the chapter deck is empty", () => {
    render(<EquationEmptyState chapterLabel="Anatomy" />);

    expect(
      screen.getByRole("link", { name: /Browse all/i })
    ).toHaveAttribute("href", EQUATION_BOOK_COPY.browseHref);
  });

  it("falls back to No chapter yet when no chapter is selected", () => {
    render(<EquationEmptyState />);
    expect(
      screen.getByRole("heading", { name: "No chapter yet" })
    ).toBeInTheDocument();
  });
});
