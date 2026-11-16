import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubmitDialog } from "@/components/attempt/submit-dialog";

const summary = { total: 10, answered: 6, notAnswered: 3, marked: 2, notVisited: 1 };

function setup(overrides: Partial<Parameters<typeof SubmitDialog>[0]> = {}) {
  const props = {
    open: true,
    isSessionWise: false,
    isLastSession: true,
    sectionName: "Physics",
    summary,
    submitLabel: "Submit Test",
    submitError: null,
    isSubmitting: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  render(<SubmitDialog {...props} />);
  return props;
}

describe("SubmitDialog", () => {
  it("shows answered and unanswered counts for ordinary papers", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Submit Test?" })).toBeInTheDocument();
    expect(screen.getByText("Answered: 6")).toBeInTheDocument();
    expect(screen.getByText("Not Answered: 4")).toBeInTheDocument();
  });

  it("confirms and cancels", async () => {
    const props = setup();
    await userEvent.click(screen.getByRole("button", { name: "Submit Test" }));
    await userEvent.click(screen.getByRole("button", { name: "Review Again" }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows the section summary and next-section warning", () => {
    setup({ isSessionWise: true, isLastSession: false, submitLabel: "Next Section" });
    expect(screen.getByRole("dialog", { name: "Exam Summary" })).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("Not visited").nextSibling).toHaveTextContent("1");
    expect(screen.getByText(/submit this section\?/)).toBeInTheDocument();
    expect(screen.getByText(/cannot return to this section/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("asks about the whole test on the last section", () => {
    setup({ isSessionWise: true, isLastSession: true });
    expect(screen.getByText(/submit the test\?/)).toBeInTheDocument();
    expect(screen.queryByText(/cannot return/)).not.toBeInTheDocument();
  });

  it("shows submit errors", () => {
    setup({ submitError: "Network down" });
    expect(screen.getByRole("alert")).toHaveTextContent("Network down");
  });

  it("blocks cancel and Escape while submitting", async () => {
    const props = setup({ isSubmitting: true });
    expect(screen.getByRole("button", { name: "Submit Test" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Review Again" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("cancels on Escape when idle", async () => {
    const props = setup();
    await userEvent.keyboard("{Escape}");
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });
});
