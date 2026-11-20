import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestsSection } from "@/components/landing/tests-section";

describe("TestsSection", () => {
  it("renders new, in-progress and completed paper cards", () => {
    render(<TestsSection />);

    expect(
      screen.getByRole("heading", { name: "Tests that feel like the real thing" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "NEET Full Mock 1" })
    ).toBeInTheDocument();
    expect(screen.getByText("NEW")).toBeInTheDocument();
    expect(screen.getByText("4 of 10 answered")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED ✓")).toBeInTheDocument();
    expect(screen.getByText(/Best score 6\/10/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Score 6 of 10" })).toBeInTheDocument();
  });

  it("sends every action to login", () => {
    render(<TestsSection />);

    for (const name of ["Start test", "Resume", "Review"]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "href",
        "/login"
      );
    }
  });
});
