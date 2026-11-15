import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChapterRail } from "@/components/equation-book/chapter-rail";
import { cardsForChapter } from "@/lib/equation-book/selectors";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";

describe("ChapterRail", () => {
  it("renders nothing when there are no cards", () => {
    const { container } = render(
      <ChapterRail cards={[]} activeIndex={0} onSelect={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("lists chapter cards and selects an index", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const cards = cardsForChapter(EQUATION_BOOK_DATA.cards, "laws-of-motion");

    render(
      <ChapterRail cards={cards} activeIndex={0} onSelect={onSelect} />
    );

    expect(screen.getByText("In this chapter")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Net force on a free body/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Sliding down a rough incline/i })
    );
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
