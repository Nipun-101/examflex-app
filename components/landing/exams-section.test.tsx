import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExamsSection } from "@/components/landing/exams-section";

describe("ExamsSection", () => {
  it("renders NEET and JEE goal cards with subjects and CTAs", () => {
    render(<ExamsSection />);

    expect(
      screen.getByRole("heading", { name: "Which exam are you cracking?" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "NEET" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "JEE" })).toBeInTheDocument();
    expect(screen.getByText("For future doctors")).toBeInTheDocument();
    expect(screen.getByText("For future engineers")).toBeInTheDocument();
    expect(screen.getByText("Biology")).toBeInTheDocument();
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start NEET prep/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start JEE prep/i })
    ).toBeInTheDocument();
  });
});
