import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PerformanceSection } from "@/components/landing/performance-section";

describe("PerformanceSection", () => {
  it("renders stats, mock score chart, and subject performance", () => {
    render(<PerformanceSection />);

    expect(
      screen.getByRole("heading", { name: "Know exactly where you stand" })
    ).toBeInTheDocument();
    expect(screen.getByText("548 / 720")).toBeInTheDocument();
    expect(screen.getByText("+18")).toBeInTheDocument();
    expect(screen.getByText("~14k to 19k")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
    expect(screen.getByText("+36 in 3 mocks")).toBeInTheDocument();
    expect(screen.getByText("Mock 10")).toBeInTheDocument();
    expect(screen.getByText("Mock 12")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("Biology")).toBeInTheDocument();
    expect(screen.getByText("284 / 360")).toBeInTheDocument();
    expect(
      screen.getByText(/force and friction need another look/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Illustrative data · No admission prediction")
    ).toBeInTheDocument();
  });
});
