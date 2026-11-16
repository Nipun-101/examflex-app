import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttemptTimer } from "@/components/attempt/attempt-timer";

describe("AttemptTimer", () => {
  it("renders the countdown", () => {
    render(<AttemptTimer secondsLeft={125} />);
    expect(screen.getByRole("timer")).toHaveAttribute(
      "aria-label",
      "Time left 02:05"
    );
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("escalates to a warning at five minutes", () => {
    render(<AttemptTimer secondsLeft={300} />);
    expect(screen.getByRole("timer").className).toContain("bg-study-peach");
    expect(screen.getByRole("timer").className).not.toContain("font-bold");
  });

  it("goes critical in the last minute", () => {
    render(<AttemptTimer secondsLeft={30} />);
    expect(screen.getByRole("timer").className).toContain("font-bold");
  });

  it("stays neutral with plenty of time", () => {
    render(<AttemptTimer secondsLeft={3600} />);
    expect(screen.getByRole("timer").className).toContain("bg-white");
    expect(screen.getByText("1:00:00")).toBeInTheDocument();
  });
});
