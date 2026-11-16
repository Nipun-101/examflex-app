import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarketingLanding } from "@/components/landing/marketing-landing";

vi.mock("@/components/auth/google-sign-in-prompt", () => ({
  GoogleSignInPrompt: () => <div data-testid="google-sign-in-prompt" />,
}));

describe("MarketingLanding", () => {
  it("renders the public marketing composition and Google prompt mount", () => {
    render(<MarketingLanding />);
    expect(
      screen.getByRole("heading", { name: /Rise above cutoffs/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByTestId("google-sign-in-prompt")).toBeInTheDocument();
  });
});
