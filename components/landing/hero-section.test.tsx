import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "@/components/landing/hero-section";

describe("HeroSection", () => {
  it("renders headline, CTAs, trust markers, and floating stats", () => {
    render(<HeroSection />);

    expect(
      screen.getByRole("heading", { name: /Rise above cutoffs/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start Preparing/i })
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: /Explore Tests/i })
    ).toHaveAttribute("href", "#tests");
    expect(screen.getByText("50,000+ questions")).toBeInTheDocument();
    expect(screen.getByText("Top 3%")).toBeInTheDocument();
    expect(screen.getByText("+14%")).toBeInTheDocument();
  });
});
