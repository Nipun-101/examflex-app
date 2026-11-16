import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExitDialog } from "@/components/attempt/exit-dialog";

function setup(overrides: Partial<Parameters<typeof ExitDialog>[0]> = {}) {
  const props = {
    open: true,
    isExiting: false,
    exitError: null,
    onStay: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<ExitDialog {...props} />);
  return props;
}

describe("ExitDialog", () => {
  it("asks to leave and offers both choices", async () => {
    const props = setup();
    expect(screen.getByRole("dialog", { name: "Leave the exam?" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Stay in Exam" }));
    await userEvent.click(screen.getByRole("button", { name: "Pause & Leave" }));
    expect(props.onStay).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("stays on Escape when idle", async () => {
    const props = setup();
    await userEvent.keyboard("{Escape}");
    expect(props.onStay).toHaveBeenCalledTimes(1);
  });

  it("locks while saving", async () => {
    const props = setup({ isExiting: true });
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Stay in Exam" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(props.onStay).not.toHaveBeenCalled();
  });

  it("shows the exit error", () => {
    setup({ exitError: "Could not save" });
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
  });
});
