import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubjectTabs } from "@/components/equation-book/subject-tabs";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";

describe("SubjectTabs", () => {
  it("marks the active subject and notifies on change", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SubjectTabs
        subjects={EQUATION_BOOK_DATA.subjects}
        activeId="physics"
        onSelect={onSelect}
      />
    );

    expect(screen.getByRole("tab", { name: "Physics" })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    await user.click(screen.getByRole("tab", { name: "Chemistry" }));
    expect(onSelect).toHaveBeenCalledWith("chemistry");
  });
});
