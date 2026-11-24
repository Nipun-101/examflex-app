import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MistakeListSheet,
  MistakeListTrigger,
} from "@/components/mistake-book/mistake-list-sheet";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

const MISTAKES = MISTAKE_BOOK_DATA.mistakes;

function renderSheet(open = true) {
  const onClose = vi.fn();
  const onSelect = vi.fn();
  render(
    <MistakeListSheet
      open={open}
      onClose={onClose}
      mockLabel="KINEMATICS - 1"
      mistakes={MISTAKES}
      activeIndex={0}
      onSelect={onSelect}
    />
  );
  return { onClose, onSelect };
}

describe("MistakeListSheet", () => {
  it("renders nothing while closed", () => {
    renderSheet(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lists every mistake and marks the active one", () => {
    renderSheet();
    expect(
      screen.getByRole("dialog", { name: "In this review" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${MISTAKES.length} mistakes left`)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Q34 · PHYSICS · KINEMATICS - 1/ })
    ).toHaveAttribute("aria-current", "true");
  });

  it("jumps to the picked mistake and closes", async () => {
    const user = userEvent.setup();
    const { onSelect, onClose } = renderSheet();
    const rows = screen
      .getAllByRole("button")
      .filter((button) => button.textContent?.includes("KINEMATICS - 1"));
    await user.click(rows[1]!);
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes from the close button and Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderSheet();
    await user.click(screen.getByRole("button", { name: "Close mistake list" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("MistakeListTrigger", () => {
  it("shows position and opens the sheet", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<MistakeListTrigger current={2} total={7} onOpen={onOpen} />);
    expect(screen.getByText("2 / 7")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /All mistakes in this review/i })
    );
    expect(onOpen).toHaveBeenCalled();
  });
});
