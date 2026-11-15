import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EquationBookView } from "@/components/equation-book/equation-book-view";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";
import type { EquationBookPageData } from "@/types/equation-book";

describe("EquationBookView", () => {
  it("renders the featured physics card and advances with Next", async () => {
    const user = userEvent.setup();
    render(<EquationBookView data={EQUATION_BOOK_DATA} />);

    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 8 equations")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(screen.getByText("2 of 8 equations")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(
      screen.getByRole("heading", { name: /rough incline/i })
    ).toBeInTheDocument();
    expect(screen.getByText("3 of 8 equations")).toBeInTheDocument();
  });

  it("switches subject and chapter placeholders", async () => {
    const user = userEvent.setup();
    render(<EquationBookView data={EQUATION_BOOK_DATA} />);

    await user.click(screen.getByRole("tab", { name: "Biology" }));
    expect(screen.getByLabelText("Chapter")).toHaveValue("cell-cycle");
    expect(
      screen.getByRole("heading", { name: /DNA content after S phase/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Chemistry" }));
    expect(screen.getByLabelText("Chapter")).toHaveValue(
      "chemical-equilibrium"
    );
  });

  it("changes chapter within a subject and supports Previous", async () => {
    const user = userEvent.setup();
    render(<EquationBookView data={EQUATION_BOOK_DATA} />);

    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(screen.getByText("2 of 8 equations")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Previous/i }));
    expect(screen.getByText("1 of 8 equations")).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Chapter"),
      "work-energy-power"
    );
    expect(
      screen.getByRole("heading", { name: /Work by a constant force/i })
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 1 equations")).toBeInTheDocument();
  });

  it("jumps to a card from the chapter rail", async () => {
    const user = userEvent.setup();
    render(<EquationBookView data={EQUATION_BOOK_DATA} />);

    await user.click(
      screen.getByRole("button", {
        name: /Sliding down a rough incline/i,
      })
    );
    expect(screen.getByText("3 of 8 equations")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Sliding down a rough incline/i,
      })
    ).toBeInTheDocument();
  });



  it("shows an empty state when a chapter has no cards", () => {
    const emptyData: EquationBookPageData = {
      ...EQUATION_BOOK_DATA,
      cards: [],
    };

    render(<EquationBookView data={emptyData} />);
    expect(
      screen.getByText(/No equations in this chapter yet/i)
    ).toBeInTheDocument();
  });

  it("falls back when subjects are missing", () => {
    const sparse: EquationBookPageData = {
      ...EQUATION_BOOK_DATA,
      subjects: [],
      chapters: [],
      cards: [],
    };

    render(<EquationBookView data={sparse} />);
    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No equations in this chapter yet/i)
    ).toBeInTheDocument();
  });

  it("clears the chapter when switching to a subject with none", async () => {
    const user = userEvent.setup();
    const data: EquationBookPageData = {
      ...EQUATION_BOOK_DATA,
      subjects: [
        { id: "physics", label: "Physics" },
        { id: "chemistry", label: "Chemistry" },
      ],
      chapters: EQUATION_BOOK_DATA.chapters.filter(
        (chapter) => chapter.subjectId === "physics"
      ),
    };

    render(<EquationBookView data={data} />);
    await user.click(screen.getByRole("tab", { name: "Chemistry" }));
    expect(screen.queryByLabelText("Chapter")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No equations in this chapter yet/i)
    ).toBeInTheDocument();
  });
});

