import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AttemptHeader } from "@/components/attempt/attempt-header";

function setup(overrides: Partial<Parameters<typeof AttemptHeader>[0]> = {}) {
  const props = {
    title: "NEET - Optics",
    questionNumber: 2,
    totalQuestions: 10,
    sectionLabel: "Physics",
    zoomIndex: 2,
    onZoomIndexChange: vi.fn(),
    secondsLeft: 125,
    showLanguageToggle: true,
    language: "en" as const,
    onLanguageChange: vi.fn(),
    ...overrides,
  };
  render(<AttemptHeader {...props} />);
  return props;
}

describe("AttemptHeader", () => {
  it("shows title, progress, section and timer", () => {
    setup();
    expect(screen.getByRole("heading", { name: "NEET - Optics" })).toBeInTheDocument();
    expect(screen.getByText("Q 2/10 · Physics")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "Time left 02:05");
    expect(screen.getByRole("img", { name: "ExamFlex" })).toHaveAttribute(
      "src",
      "/examflex-wordmark.svg"
    );
  });

  it("does not link away from the attempt", () => {
    setup();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("wires zoom and language", async () => {
    const props = setup();
    await userEvent.click(screen.getByRole("button", { name: "Zoom in question" }));
    await userEvent.click(screen.getByRole("radio", { name: "മലയാളം" }));
    expect(props.onZoomIndexChange).toHaveBeenCalledWith(3);
    expect(props.onLanguageChange).toHaveBeenCalledWith("ml");
  });

  it("hides the language toggle for single-language exams", () => {
    setup({ showLanguageToggle: false });
    expect(screen.queryByRole("radiogroup", { name: "Language" })).not.toBeInTheDocument();
  });
});
