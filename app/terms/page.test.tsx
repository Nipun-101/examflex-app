import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TermsPage from "@/app/terms/page";

describe("TermsPage", () => {
  it("renders payments, cancellation, and refunds", () => {
    render(<TermsPage />);

    expect(
      screen.getByRole("heading", { name: "Terms of Service" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Plans and payments" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cancellation policy" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Refund policy" })
    ).toBeInTheDocument();
    expect(document.getElementById("refunds")).toBeTruthy();
  });
});
