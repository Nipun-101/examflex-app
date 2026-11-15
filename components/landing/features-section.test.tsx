import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeaturesSection } from "@/components/landing/features-section";

describe("FeaturesSection", () => {
  it("renders all four why-ExamFlex feature cards", () => {
    render(<FeaturesSection />);

    expect(
      screen.getByRole("heading", { name: "Study smarter, not just longer" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Real mock tests" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Performance analytics" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Personalized practice" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Smart recommendations" })
    ).toBeInTheDocument();
  });
});
