import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChapterSelect } from "@/components/equation-book/chapter-select";
import { chaptersForSubject } from "@/lib/equation-book/selectors";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";

describe("ChapterSelect", () => {
  it("lists chapters and reports selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const chapters = chaptersForSubject(EQUATION_BOOK_DATA.chapters, "physics");

    render(
      <ChapterSelect
        chapters={chapters}
        value="laws-of-motion"
        onChange={onChange}
      />
    );

    const select = screen.getByLabelText("Chapter");
    expect(select).toHaveValue("laws-of-motion");

    await user.selectOptions(select, "work-energy-power");
    expect(onChange).toHaveBeenCalledWith("work-energy-power");
  });
});
