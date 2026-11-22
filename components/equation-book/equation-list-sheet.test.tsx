import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  EquationListSheet,
  EquationListTrigger,
} from "@/components/equation-book/equation-list-sheet";
import { TEST_EQUATIONS } from "@/lib/equation-book/test-fixtures";

function renderSheet(open = true) {
  const onClose = vi.fn();
  const onSelect = vi.fn();
  render(
    <EquationListSheet
      open={open}
      onClose={onClose}
      chapterLabel="Laws of Motion"
      cards={TEST_EQUATIONS}
      activeIndex={0}
      onSelect={onSelect}
    />
  );
  return { onClose, onSelect };
}

describe("EquationListSheet", () => {
  it("renders nothing while closed", () => {
    renderSheet(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lists every equation and marks the active one", () => {
    renderSheet();
    expect(
      screen.getByRole("dialog", { name: "In this chapter" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Laws of Motion · ${TEST_EQUATIONS.length} equations`)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Net force on a free body/i })
    ).toHaveAttribute("aria-current", "true");
  });

  it("jumps to the picked equation and closes", async () => {
    const user = userEvent.setup();
    const { onSelect, onClose } = renderSheet();
    await user.click(
      screen.getByRole("button", { name: /Static friction limit/i })
    );
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes from the close button and Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderSheet();
    await user.click(screen.getByRole("button", { name: "Close equation list" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("EquationListTrigger", () => {
  it("shows position and opens the sheet", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<EquationListTrigger current={3} total={24} onOpen={onOpen} />);
    expect(screen.getByText("3 / 24")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /All equations in this chapter/i })
    );
    expect(onOpen).toHaveBeenCalled();
  });
});
