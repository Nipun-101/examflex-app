import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const startGoogleSignIn = vi.fn();

vi.mock("@/lib/auth/google", () => ({
  startGoogleSignIn: (...args: unknown[]) => startGoogleSignIn(...args),
}));

describe("GoogleSignInButton", () => {
  it("starts Google sign-in on click", async () => {
    const user = userEvent.setup();
    startGoogleSignIn.mockResolvedValue(undefined);
    const onError = vi.fn();
    render(<GoogleSignInButton onError={onError} />);

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    );
    expect(startGoogleSignIn).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("reports errors when Google sign-in cannot start", async () => {
    const user = userEvent.setup();
    startGoogleSignIn.mockRejectedValue(new Error("missing config"));
    const onError = vi.fn();
    render(<GoogleSignInButton onError={onError} />);

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    );
    expect(onError).toHaveBeenCalledWith(
      expect.stringMatching(/could not be started/i)
    );
  });
});
