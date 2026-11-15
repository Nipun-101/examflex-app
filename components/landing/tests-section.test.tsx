import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestsSection } from "@/components/landing/tests-section";

describe("TestsSection", () => {
  it("renders practice heading and all mock test cards", () => {
    render(<TestsSection />);

    expect(
      screen.getByRole("heading", {
        name: "Tests that feel like the real thing",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View all tests/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "NEET Full Mock Test #12" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "JEE Main — Physics Sprint" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Organic Chemistry: Reaction Mechanisms",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start test" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Resume" })).toHaveLength(2);
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });
});
