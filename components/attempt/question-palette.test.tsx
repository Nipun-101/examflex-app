import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionPalette } from "@/components/attempt/question-palette";
import type { QuestionStatus } from "@/types/attempt-runner";

const statuses: QuestionStatus[] = [
  "answered",
  "not-answered",
  "marked",
  "marked-answered",
  "not-visited",
];

function setup(overrides: Partial<Parameters<typeof QuestionPalette>[0]> = {}) {
  const props = {
    statuses,
    currentIndex: 1,
    onSelect: vi.fn(),
    isPaused: false,
    onTogglePause: vi.fn(),
    testTitle: "Kinematics",
    onSubmit: vi.fn(),
    submitLabel: "Submit Test",
    ...overrides,
  };
  render(<QuestionPalette {...props} />);
  return props;
}

describe("QuestionPalette", () => {
  it("lists every question with a status label and marks the current one", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Question 1, answered" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Question 4, answered and marked for review" })
    ).toBeInTheDocument();
    const current = screen.getByRole("button", {
      name: "Question 2, not answered",
    });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current.className).toContain("bg-study-lime");
    expect(
      screen.getByRole("button", { name: "Question 1, answered" })
    ).toHaveClass("bg-study-green");
    expect(
      screen.getByRole("button", { name: "Question 3, marked for review" })
    ).toHaveStyle({ backgroundColor: "#4f446c" });
    expect(
      screen.getByRole("button", {
        name: "Question 4, answered and marked for review",
      })
    ).toHaveStyle({ backgroundColor: "#4f446c" });
  });

  it("selects a question", async () => {
    const props = setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Question 5, not visited" })
    );
    expect(props.onSelect).toHaveBeenCalledWith(4);
  });

  it("counts each status in the legend", () => {
    setup();
    const legend = screen.getByRole("region", { name: "Legend" });
    expect(within(legend).getByText("Marked & Answered")).toBeInTheDocument();
    expect(within(legend).getAllByText("1")).toHaveLength(5);
  });

  it("shows the default or section subtitle", () => {
    setup();
    expect(screen.getByText("Mock Test Attempt")).toBeInTheDocument();
    expect(screen.getByText("Question Palette:")).toBeInTheDocument();
  });

  it("shows the section name for session-wise papers", () => {
    setup({ sectionTitle: "Physics A" });
    expect(screen.getByText("Physics A")).toBeInTheDocument();
    expect(screen.getByText("Physics A :")).toBeInTheDocument();
  });

  it("pauses and submits", async () => {
    const props = setup();
    await userEvent.click(screen.getByRole("button", { name: /Pause Test/ }));
    await userEvent.click(screen.getByRole("button", { name: "Submit Test" }));
    expect(props.onTogglePause).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("offers resume and disables submit while paused", () => {
    setup({ isPaused: true });
    expect(screen.getByRole("button", { name: /Resume Test/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Test" })).toBeDisabled();
  });
});
