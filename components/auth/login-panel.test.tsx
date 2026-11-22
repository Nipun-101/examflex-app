import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPanel } from "@/components/auth/login-panel";

const push = vi.fn();
const replace = vi.fn();
const verifyOtp = vi.fn();
const setAuthTokens = vi.fn();
const getAuthToken = vi.fn(() => null);
const healAuthSessionCookies = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/api/auth", () => ({
  verifyOtp: (...args: unknown[]) => verifyOtp(...args),
}));

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => getAuthToken(),
  healAuthSessionCookies: () => healAuthSessionCookies(),
  setAuthTokens: (...args: unknown[]) => setAuthTokens(...args),
}));

vi.mock("@/components/auth/google-sign-in-button", () => ({
  GoogleSignInButton: ({
    onError,
  }: {
    onError: (message: string) => void;
  }) => (
    <button type="button" onClick={() => onError("google failed")}>
      Continue with Google
    </button>
  ),
}));

/**
 * The real form (and its MSG91 widget) is covered by mobile-otp-form.test.tsx.
 * Here it is replaced by buttons that report each possible outcome, so these
 * tests are about what the login panel does with them.
 */
let reportedOutcome: unknown;
vi.mock("@/components/auth/mobile-otp-form", () => ({
  MobileOtpForm: ({
    onVerified,
    finishingLabel,
  }: {
    onVerified: (token: string, mobile: string) => Promise<unknown>;
    finishingLabel?: string;
  }) => (
    <div data-testid="mobile-otp-form">
      <span>{finishingLabel}</span>
      <button
        type="button"
        onClick={async () => {
          reportedOutcome = await onVerified("msg91-token", "9876543210");
        }}
      >
        simulate verified code
      </button>
    </div>
  ),
}));

describe("LoginPanel", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    verifyOtp.mockReset();
    setAuthTokens.mockReset();
    getAuthToken.mockReturnValue(null);
    document.body.style.overflow = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders brand and auth actions", () => {
    render(<LoginPanel />);
    expect(
      screen.getByRole("heading", { name: /Log in to ExamFlex/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with mobile number" })
    ).toBeInTheDocument();
  });

  it("closes on backdrop click, close button, and Escape", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<LoginPanel />);
    await user.click(screen.getByRole("button", { name: "Close login" }));
    expect(push).toHaveBeenCalledWith("/");
    unmount();

    push.mockClear();
    const second = render(<LoginPanel />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(push).toHaveBeenCalledWith("/");
    second.unmount();

    push.mockClear();
    render(<LoginPanel />);
    await user.keyboard("{Enter}");
    expect(push).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows Google errors from the sign-in button", async () => {
    const user = userEvent.setup();
    render(<LoginPanel />);
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(screen.getByRole("alert")).toHaveTextContent("google failed");
  });

  it("redirects when already authenticated", async () => {
    getAuthToken.mockReturnValue("existing");
    render(<LoginPanel />);
    await waitFor(() => {
      expect(healAuthSessionCookies).toHaveBeenCalled();
      expect(replace).toHaveBeenCalledWith("/today");
    });
  });

  async function openMobileForm(user: ReturnType<typeof userEvent.setup>) {
    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );
    return screen.getByTestId("mobile-otp-form");
  }

  const apiUser = {
    id: "1",
    name: "S",
    email: "s@examflex.in",
    role: "student",
  };

  it("opens the themed mobile form in place of the buttons", async () => {
    const user = userEvent.setup();
    render(<LoginPanel />);
    await openMobileForm(user);
    expect(
      screen.queryByRole("button", { name: "Continue with Google" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Signing you in…")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Other ways to log in/ }));
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeInTheDocument();
  });

  it("signs in with the verified code and goes to Today", async () => {
    const user = userEvent.setup();
    verifyOtp.mockResolvedValue({
      ok: true,
      data: { accessToken: "access", isNewUser: false, user: apiUser },
    });
    render(<LoginPanel />);
    await openMobileForm(user);
    await user.click(screen.getByText("simulate verified code"));

    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalledWith("msg91-token");
      expect(setAuthTokens).toHaveBeenCalledWith("access");
      expect(replace).toHaveBeenCalledWith("/today");
    });
    expect(reportedOutcome).toEqual({ ok: true });
  });

  it("honours a safe redirect query after sign-in", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/login?redirect=%2Fprofile");
    verifyOtp.mockResolvedValue({
      ok: true,
      data: { accessToken: "access", isNewUser: false, user: apiUser },
    });
    render(<LoginPanel />);
    await openMobileForm(user);
    await user.click(screen.getByText("simulate verified code"));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/profile"));
    window.history.pushState({}, "", "/");
  });

  it("lets the learner retry the same code on a network or server error", async () => {
    const user = userEvent.setup();
    verifyOtp.mockResolvedValueOnce({ ok: false, message: "offline" });
    render(<LoginPanel />);
    await openMobileForm(user);
    await user.click(screen.getByText("simulate verified code"));
    await waitFor(() => expect(reportedOutcome).toBeDefined());
    expect(reportedOutcome).toMatchObject({ ok: false, retryable: true });
    expect(
      (reportedOutcome as { message: string }).message
    ).toMatch(/something went wrong while completing sign-in/i);
    expect(setAuthTokens).not.toHaveBeenCalled();

    verifyOtp.mockResolvedValueOnce({ ok: false, status: 503, message: "down" });
    await user.click(screen.getByText("simulate verified code"));
    await waitFor(() =>
      expect(reportedOutcome).toMatchObject({ retryable: true })
    );
  });

  it("shows the server's reason and asks for a new code when the account cannot sign in", async () => {
    const user = userEvent.setup();
    verifyOtp.mockResolvedValue({
      ok: false,
      status: 401,
      message: "Your account has been deactivated.",
    });
    render(<LoginPanel />);
    await openMobileForm(user);
    await user.click(screen.getByText("simulate verified code"));
    await waitFor(() => expect(reportedOutcome).toBeDefined());
    expect(reportedOutcome).toEqual({
      ok: false,
      retryable: false,
      message: "Your account has been deactivated.",
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("falls back to a generic message when a 4xx has none", async () => {
    const user = userEvent.setup();
    verifyOtp.mockResolvedValue({ ok: false, status: 400, message: "" });
    render(<LoginPanel />);
    await openMobileForm(user);
    await user.click(screen.getByText("simulate verified code"));
    await waitFor(() => expect(reportedOutcome).toBeDefined());
    expect(reportedOutcome).toMatchObject({
      retryable: false,
      message: expect.stringMatching(/something went wrong/i),
    });
  });
});
