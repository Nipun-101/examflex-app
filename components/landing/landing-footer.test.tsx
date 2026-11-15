import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingFooter } from "@/components/landing/landing-footer";

describe("LandingFooter", () => {
  it("renders brand, columns, and copyright", () => {
    render(<LandingFooter />);

    expect(screen.getByText(/Smart NEET & JEE preparation/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Platform" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Support" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Legal" })).toBeInTheDocument();
    expect(screen.getByText(/© 2026 ExamFlex/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "#"
    );
  });
});
