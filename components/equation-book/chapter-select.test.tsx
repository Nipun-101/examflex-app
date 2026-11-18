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
});
