import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerSection } from "@/components/landing/career-section";

describe("CareerSection", () => {
  it("renders career paths and the premium 1:1 session CTA", () => {
    render(<CareerSection />);

    expect(
      screen.getByRole("heading", { name: "See where you could go." })
    ).toBeInTheDocument();
    for (const path of ["MBBS", "BDS", "BVSc & AH"]) {
      expect(screen.getByText(path)).toBeInTheDocument();
    }
    expect(
      screen.getByRole("link", { name: /Book my 1:1 session/i })
    ).toHaveAttribute("href", "/login");
  });
});
