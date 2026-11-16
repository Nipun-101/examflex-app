import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContactUsPage from "@/app/contact/page";

describe("ContactUsPage", () => {
  it("renders contact email and checklist", () => {
    render(<ContactUsPage />);

    expect(
      screen.getByRole("heading", { name: "Contact us" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What to include" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@examflex.in" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:support@examflex.in")
    );
  });
});
