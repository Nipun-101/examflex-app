import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingLanding } from "@/components/landing/marketing-landing";

describe("MarketingLanding", () => {
  it("renders the public marketing composition", () => {
    render(<MarketingLanding />);
    expect(
      screen.getByRole("heading", { name: /Rise above cutoffs/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
