import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "@/components/landing/hero-section";

describe("HeroSection", () => {
  it("renders headline, CTAs, trust markers, and the product collage", () => {
    render(<HeroSection />);

    expect(
      screen.getByRole("heading", { name: /Rise above cutoffs/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start preparing/i })
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: /Explore tests/i })
    ).toHaveAttribute("href", "#tests");
    expect(screen.getByText("NTA-pattern mocks")).toBeInTheDocument();
    expect(screen.getByText("NCERT-referenced")).toBeInTheDocument();
    expect(screen.getByText("Practice, not classes")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Score 548 of 720" })).toBeInTheDocument();
    expect(screen.getByText("~14k to 19k")).toBeInTheDocument();
    expect(screen.getByText("Open Mistake Book →")).toBeInTheDocument();
  });
});
