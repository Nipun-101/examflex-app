import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PauseOverlay } from "@/components/attempt/pause-overlay";

function setup(overrides: Partial<Parameters<typeof PauseOverlay>[0]> = {}) {
  const props = {
    open: true,
    timeUsedSeconds: 724,
    remainingSeconds: 3909,
    paperUsedSeconds: null,
    sectionName: null,
    exitLabel: "Exit to Chapter Wise",
    isResuming: false,
    isExiting: false,
    error: null,
    onResume: vi.fn(),
    onExit: vi.fn(),
    ...overrides,
  };
  render(<PauseOverlay {...props} />);
  return props;
}

describe("PauseOverlay", () => {
  it("renders nothing when closed", () => {
    setup({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows used and remaining time", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Test Paused" })).toBeInTheDocument();
    expect(screen.getByText("12m 04s")).toBeInTheDocument();
    expect(screen.getByText("1h 05m 09s")).toBeInTheDocument();
  });

  it("resumes and exits with the paper-type label", async () => {
    const props = setup();
    await userEvent.click(screen.getByRole("button", { name: "Resume Test" }));
    await userEvent.click(screen.getByRole("button", { name: "Exit to Chapter Wise" }));
    expect(props.onResume).toHaveBeenCalledTimes(1);
    expect(props.onExit).toHaveBeenCalledTimes(1);
  });

  it("cannot be dismissed with Escape", async () => {
    const props = setup();
    await userEvent.keyboard("{Escape}");
    expect(props.onResume).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows paper-so-far for session-wise papers", () => {
    setup({ paperUsedSeconds: 1800, sectionName: "Physics" });
    expect(screen.getByText("Paper so far: 30m 00s · this section: Physics")).toBeInTheDocument();
  });

  it("shows paper-so-far without a section name", () => {
    setup({ paperUsedSeconds: 60 });
    expect(screen.getByText("Paper so far: 1m 00s")).toBeInTheDocument();
  });

  it("disables actions while resuming or exiting", () => {
    setup({ isResuming: true });
    expect(screen.getByRole("button", { name: "Resuming..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Exit to Chapter Wise" })).toBeDisabled();
  });

  it("shows exit progress and errors", () => {
    setup({ isExiting: true, error: "Could not save" });
    expect(screen.getByRole("button", { name: "Saving & Exiting..." })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
  });
});
