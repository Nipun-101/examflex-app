import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaSection } from "@/components/landing/cta-section";

describe("CtaSection", () => {
  it("renders the closing CTA and free practice link", () => {
    render(<CtaSection />);

    expect(
      screen.getByRole("heading", {
        name: "Your rank is built one test at a time.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start practicing free/i })
    ).toHaveAttribute("href", "#signup");
  });
});
