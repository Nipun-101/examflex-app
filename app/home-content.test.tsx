import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeContent } from "@/app/home-content";

vi.mock("@/components/auth/google-oauth-return", () => ({
  GoogleOAuthReturn: () => <div>Google OAuth return</div>,
}));

describe("HomeContent", () => {
  it("renders marketing when there is no OAuth return", async () => {
    const ui = await HomeContent({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(
      screen.getByRole("heading", { name: /Rise above cutoffs/i })
    ).toBeInTheDocument();
  });

  it("renders Google OAuth return for code or error", async () => {
    const withCode = await HomeContent({
      searchParams: Promise.resolve({ code: "abc" }),
    });
    const { unmount } = render(withCode);
    expect(screen.getByText("Google OAuth return")).toBeInTheDocument();
    unmount();

    const withError = await HomeContent({
      searchParams: Promise.resolve({ error: "access_denied" }),
    });
    render(withError);
    expect(screen.getByText("Google OAuth return")).toBeInTheDocument();
  });
});
