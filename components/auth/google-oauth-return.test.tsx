import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleOAuthReturn } from "@/components/auth/google-oauth-return";

const completeGoogleSession = vi.fn();
const setAuthTokens = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/auth/google", () => ({
  completeGoogleSession: (...args: unknown[]) => completeGoogleSession(...args),
}));

vi.mock("@/lib/auth/tokens", () => ({
  setAuthTokens: (...args: unknown[]) => setAuthTokens(...args),
}));

describe("GoogleOAuthReturn", () => {
  beforeEach(() => {
    completeGoogleSession.mockReset();
    setAuthTokens.mockReset();
    replace.mockReset();
  });

  it("stores tokens and redirects on success", async () => {
    completeGoogleSession.mockResolvedValue({
      ok: true,
      accessToken: "tok",
      expiresIn: 900,
      nextPath: "/today",
    });
    render(<GoogleOAuthReturn />);
    expect(screen.getByRole("status")).toHaveTextContent(/Signing you in/i);
    await waitFor(() => {
      expect(setAuthTokens).toHaveBeenCalledWith("tok", null, 900);
      expect(replace).toHaveBeenCalledWith("/today");
    });
  });

  it("shows an error state with a back link", async () => {
    completeGoogleSession.mockResolvedValue({
      ok: false,
      message: "Google sign-in was cancelled.",
    });
    render(<GoogleOAuthReturn />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Could not sign in" })
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Google sign-in was cancelled.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("ignores late results after unmount", async () => {
    let resolveSession: (value: {
      ok: true;
      accessToken: string;
      nextPath: string;
    }) => void = () => undefined;
    completeGoogleSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSession = resolve;
        })
    );

    const { unmount } = render(<GoogleOAuthReturn />);
    unmount();
    resolveSession({
      ok: true,
      accessToken: "late",
      nextPath: "/today",
    });
    await Promise.resolve();
    expect(setAuthTokens).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
