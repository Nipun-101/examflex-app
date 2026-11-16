import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GOOGLE_PROMPT_DISMISS_KEY,
  GoogleSignInPrompt,
} from "@/components/auth/google-sign-in-prompt";

const usePathname = vi.fn(() => "/");
const isAuthenticated = vi.fn(() => false);
const startGoogleSignIn = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

vi.mock("@/lib/auth/tokens", () => ({
  isAuthenticated: () => isAuthenticated(),
}));

vi.mock("@/lib/auth/google", () => ({
  startGoogleSignIn: (...args: unknown[]) => startGoogleSignIn(...args),
}));

describe("GoogleSignInPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    usePathname.mockReturnValue("/");
    isAuthenticated.mockReturnValue(false);
    startGoogleSignIn.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("stays hidden when the path is not home, user is authed, or dismissed", () => {
    usePathname.mockReturnValue("/login");
    const { rerender, container } = render(<GoogleSignInPrompt />);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(container).toBeEmptyDOMElement();

    usePathname.mockReturnValue("/");
    isAuthenticated.mockReturnValue(true);
    rerender(<GoogleSignInPrompt />);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(container).toBeEmptyDOMElement();

    isAuthenticated.mockReturnValue(false);
    sessionStorage.setItem(GOOGLE_PROMPT_DISMISS_KEY, "1");
    rerender(<GoogleSignInPrompt />);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("appears after the delay for anonymous home visitors", () => {
    render(<GoogleSignInPrompt />);
    expect(
      screen.queryByRole("button", { name: "Continue" })
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(
      screen.getByText(/Sign in to ExamFlex with Google/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("dismisses for the session", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<GoogleSignInPrompt />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    await user.click(
      screen.getByRole("button", { name: "Dismiss Google sign-in" })
    );
    expect(sessionStorage.getItem(GOOGLE_PROMPT_DISMISS_KEY)).toBe("1");
    expect(
      screen.queryByRole("button", { name: "Continue" })
    ).not.toBeInTheDocument();
  });

  it("starts Google sign-in toward /today", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    startGoogleSignIn.mockResolvedValue(undefined);
    render(<GoogleSignInPrompt />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(startGoogleSignIn).toHaveBeenCalledWith("/today");
  });

  it("shows an error when Google sign-in cannot start", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    startGoogleSignIn.mockRejectedValue(new Error("missing config"));
    render(<GoogleSignInPrompt />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/could not be started/i);
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });
});
