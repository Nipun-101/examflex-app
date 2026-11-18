import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChapterRail } from "@/components/equation-book/chapter-rail";
import { TEST_EQUATIONS } from "@/lib/equation-book/test-fixtures";

describe("ChapterRail", () => {
  it("lists chapter cards and selects one", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ChapterRail
        cards={TEST_EQUATIONS}
        activeIndex={0}
        onSelect={onSelect}
      />
    );

    expect(
      screen.getByRole("button", { name: /Net force on a free body/i })
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Static friction limit/i })
    );
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
