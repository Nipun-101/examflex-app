import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChapterSelect } from "@/components/equation-book/chapter-select";

describe("ChapterSelect", () => {
  it("changes chapter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ChapterSelect
        chapters={[
          { id: "top-lom", label: "Laws of motion" },
          { id: "top-wep", label: "Work, energy & power" },
        ]}
        value="top-lom"
        onChange={onChange}
      />
    );

    await user.selectOptions(screen.getByLabelText("Chapter"), "top-wep");
    expect(onChange).toHaveBeenCalledWith("top-wep");
  });

  it("constrains width so long chapter names do not blow out mobile", () => {
    const { container } = render(
      <ChapterSelect
        chapters={[
          {
            id: "top-organic",
            label: "Some Basic Principles of Organic Chemistry",
          },
        ]}
        value="top-organic"
        onChange={vi.fn()}
      />
    );

    expect(container.firstElementChild).toHaveClass("min-w-0");
    expect(screen.getByLabelText("Chapter")).toHaveClass("min-w-0", "max-w-full");
  });
});
