import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PerformanceSection } from "@/components/landing/performance-section";

describe("PerformanceSection", () => {
  it("renders stats, chart labels, and subject performance", () => {
    render(<PerformanceSection />);

    expect(
      screen.getByRole("heading", { name: "Know exactly where you stand" })
    ).toBeInTheDocument();
    expect(screen.getByText("612/720")).toBeInTheDocument();
    expect(screen.getByText("81%")).toBeInTheDocument();
    expect(screen.getByText("#1,284")).toBeInTheDocument();
    expect(screen.getByText("23 days")).toBeInTheDocument();
    expect(screen.getByText("W1")).toBeInTheDocument();
    expect(screen.getByText("W8")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("Chemistry")).toBeInTheDocument();
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(
      screen.getByText(/Focus next: Integration by parts/i)
    ).toBeInTheDocument();
  });
});
