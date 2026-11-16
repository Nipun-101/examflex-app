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
    expect(screen.getByRole("link", { name: "Help centre" })).toHaveAttribute(
      "href",
      "/help"
    );
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute(
      "href",
      "/contact"
    );
    expect(screen.getByRole("link", { name: "FAQs" })).toHaveAttribute(
      "href",
      "/faqs"
    );
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy-policy"
    );
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms"
    );
    expect(screen.getByRole("link", { name: "Refunds" })).toHaveAttribute(
      "href",
      "/terms#refunds"
    );
    expect(screen.getByRole("link", { name: "Delete account" })).toHaveAttribute(
      "href",
      "/delete-account"
    );
  });
});
