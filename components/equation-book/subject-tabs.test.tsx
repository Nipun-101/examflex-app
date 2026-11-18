import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubjectTabs } from "@/components/equation-book/subject-tabs";

describe("SubjectTabs", () => {
  it("selects a subject tab", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SubjectTabs
        subjects={[
          { id: "sub-physics", label: "Physics" },
          { id: "sub-chem", label: "Chemistry" },
        ]}
        activeId="sub-physics"
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole("tab", { name: "Chemistry" }));
    expect(onSelect).toHaveBeenCalledWith("sub-chem");
  });

  it("uses a wrapping chip row when layout is wrap", () => {
    const { container } = render(
      <SubjectTabs
        subjects={[
          { id: "", label: "All" },
          { id: "sub-physics", label: "Physics" },
        ]}
        activeId=""
        onSelect={vi.fn()}
        layout="wrap"
      />
    );

    expect(container.querySelector('[role="tablist"]')?.className).toContain(
      "flex-wrap"
    );
  });
});
