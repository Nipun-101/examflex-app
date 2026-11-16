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

describe("LoginPanel", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    verifyOtp.mockReset();
    setAuthTokens.mockReset();
    getAuthToken.mockReturnValue(null);
    document.body.style.overflow = "";
    delete window.initSendOTP;
  });

  afterEach(() => {
    cleanup();
    delete window.initSendOTP;
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

  it("loads the MSG91 widget and verifies OTP success", async () => {
    const user = userEvent.setup();
    const appendChild = vi.spyOn(document.body, "appendChild");
    verifyOtp.mockResolvedValue({
      ok: true,
      data: {
        accessToken: "access",
        expiresIn: 900,
        isNewUser: false,
        user: {
          id: "1",
          name: "S",
          email: "s@examflex.in",
          role: "student",
        },
      },
    });

    render(<LoginPanel />);
    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );

    await waitFor(() => {
      expect(appendChild).toHaveBeenCalled();
    });

    const script = appendChild.mock.calls
      .map((call) => call[0])
      .find(
        (node): node is HTMLScriptElement =>
          node instanceof HTMLScriptElement &&
          node.src.includes("otp-provider.js")
      );
    expect(script).toBeTruthy();

    window.initSendOTP = (config) => {
      config.success({ message: "msg91-token" });
    };
    script?.onload?.(new Event("load"));

    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalledWith("msg91-token");
      expect(setAuthTokens).toHaveBeenCalled();
      expect(replace).toHaveBeenCalledWith("/today");
    });
  });

  it("shows verifying failures and cancelled OTP quietly", async () => {
    const user = userEvent.setup();
    verifyOtp.mockResolvedValue({ ok: false, message: "nope" });

    render(<LoginPanel />);
    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );

    await waitFor(() => {
      expect(document.querySelector("#msg91-otp-widget")).toBeTruthy();
    });

    const scripts = Array.from(document.scripts);
    const script = scripts.find((s) => s.src.includes("otp-provider.js"));
    window.initSendOTP = (config) => {
      config.success({ message: "msg91-token" });
    };
    script?.onload?.(new Event("load"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("surfaces OTP widget failure notices and mounts an existing widget", async () => {
    const user = userEvent.setup();
    let latestConfig: { failure: (error: unknown) => void } | null = null;
    window.initSendOTP = (config) => {
      latestConfig = config;
    };

    render(<LoginPanel />);
    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );

    await waitFor(() => {
      expect(latestConfig).not.toBeNull();
    });

    latestConfig?.failure({ message: "Bad OTP" });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Bad OTP");
    });

    latestConfig?.failure({ closeByUser: true });
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );
    await waitFor(() => {
      expect(latestConfig).not.toBeNull();
    });
  });

  it("handles missing MSG91 tokens from the widget success callback", async () => {
    const user = userEvent.setup();
    let latestConfig: { success: (data: unknown) => void } | null = null;
    window.initSendOTP = (config) => {
      latestConfig = config;
    };

    render(<LoginPanel />);
    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );
    await waitFor(() => {
      expect(latestConfig).not.toBeNull();
    });

    latestConfig?.success({});
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /could not finish sign-in/i
      );
    });
  });

  it("loads the OTP script when initSendOTP is not yet available", async () => {
    const user = userEvent.setup();
    delete window.initSendOTP;
    const appendChild = vi.spyOn(document.body, "appendChild");

    const { unmount } = render(<LoginPanel />);
    window.history.pushState({}, "", "/login?redirect=%2Fprofile");
    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );

    await waitFor(() => {
      expect(appendChild).toHaveBeenCalled();
    });

    const script = appendChild.mock.calls
      .map((call) => call[0])
      .find(
        (node): node is HTMLScriptElement =>
          node instanceof HTMLScriptElement &&
          node.src.includes("otp-provider.js")
      );
    expect(script).toBeTruthy();
    script?.onload?.(new Event("load"));
    unmount();
  });

  it("redirects to a safe redirect query after OTP success", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/login?redirect=%2Fprofile");
    verifyOtp.mockResolvedValue({
      ok: true,
      data: {
        accessToken: "access",
        expiresIn: 900,
        isNewUser: false,
        user: {
          id: "1",
          name: "S",
          email: "s@examflex.in",
          role: "student",
        },
      },
    });
    let latestConfig: { success: (data: unknown) => void } | null = null;
    window.initSendOTP = (config) => {
      latestConfig = config;
    };

    render(<LoginPanel />);
    await user.click(
      screen.getByRole("button", { name: "Continue with mobile number" })
    );
    await waitFor(() => {
      expect(latestConfig).not.toBeNull();
    });
    latestConfig?.success({ message: "msg91-token" });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/profile");
    });
  });
});
