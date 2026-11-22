import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as OtpWidget from "@/lib/auth/otp-widget";
import { EmailVerifyDialog } from "@/components/profile/email-verify-dialog";
import type { ApiUserProfile } from "@/types/user";

const widget = {
  loadOtpScript: vi.fn(),
  initOtpWidget: vi.fn(),
  waitForOtpMethods: vi.fn(),
  readWidgetSettings: vi.fn(),
  sendOtp: vi.fn(),
  resendOtp: vi.fn(),
  verifyOtpCode: vi.fn(),
  isCaptchaVerified: vi.fn(),
};

vi.mock("@/lib/auth/otp-widget", async (importOriginal) => {
  const actual = await importOriginal<typeof OtpWidget>();
  return {
    ...actual,
    loadOtpScript: () => widget.loadOtpScript(),
    initOtpWidget: (...args: unknown[]) => widget.initOtpWidget(...args),
    waitForOtpMethods: () => widget.waitForOtpMethods(),
    readWidgetSettings: () => widget.readWidgetSettings(),
    sendOtp: (...args: unknown[]) => widget.sendOtp(...args),
    resendOtp: (...args: unknown[]) => widget.resendOtp(...args),
    verifyOtpCode: (...args: unknown[]) => widget.verifyOtpCode(...args),
    isCaptchaVerified: () => widget.isCaptchaVerified(),
  };
});

const verifyMyEmail = vi.fn();
vi.mock("@/lib/api/onboarding", () => ({
  verifyMyEmail: (...args: unknown[]) => verifyMyEmail(...args),
}));

const SETTINGS = { otpLength: 4, retryTimeSec: 1, retryCount: 1 };
const EMAIL = "riya@example.com";

const profile: ApiUserProfile = {
  id: "u1",
  name: "Riya",
  email: EMAIL,
  emailVerified: true,
  role: "user",
  isActive: true,
  createdAt: "2025-03-15T10:00:00.000Z",
  updatedAt: "2025-03-15T10:00:00.000Z",
};

function renderDialog(
  props: Partial<React.ComponentProps<typeof EmailVerifyDialog>> = {}
) {
  const onVerified = vi.fn();
  const onClose = vi.fn();
  render(
    <EmailVerifyDialog
      email={EMAIL}
      onVerified={onVerified}
      onClose={onClose}
      {...props}
    />
  );
  return { onVerified, onClose };
}

async function ready() {
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
  );
}

async function sendCode(user: ReturnType<typeof userEvent.setup>) {
  await ready();
  await user.click(screen.getByRole("button", { name: "Send code" }));
  await screen.findByText("Enter the 4-digit code");
}

describe("EmailVerifyDialog", () => {
  beforeEach(() => {
    Object.values(widget).forEach((fn) => fn.mockReset());
    verifyMyEmail.mockReset();
    widget.loadOtpScript.mockResolvedValue(undefined);
    widget.waitForOtpMethods.mockResolvedValue(undefined);
    widget.readWidgetSettings.mockReturnValue(SETTINGS);
    widget.sendOtp.mockResolvedValue(undefined);
    widget.resendOtp.mockResolvedValue(undefined);
    widget.verifyOtpCode.mockResolvedValue("msg91-email-token");
    widget.isCaptchaVerified.mockReturnValue(true);
    verifyMyEmail.mockResolvedValue({ ok: true, data: profile });
  });

  afterEach(cleanup);

  it("is an accessible dialog that shows where the code goes", async () => {
    renderDialog();
    const dialog = screen.getByRole("dialog", { name: "Verify your email" });
    expect(dialog).toHaveAccessibleDescription(
      "We’ll email you a code to confirm it’s yours."
    );
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Getting ready/ })).toBeDisabled();
    await ready();
    expect(widget.initOtpWidget).toHaveBeenCalledWith("msg91-email-captcha");
  });

  it("sends the code to the email as-is, verifies it and hands back the profile", async () => {
    const user = userEvent.setup();
    const { onVerified } = renderDialog();
    await sendCode(user);

    expect(widget.sendOtp).toHaveBeenCalledWith(EMAIL);
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "Enter the code we emailed you."
    );
    expect(
      screen.getByText("Can’t find it? Check your spam or promotions folder.")
    ).toBeInTheDocument();

    await user.keyboard("1234");

    await waitFor(() => expect(onVerified).toHaveBeenCalledWith(profile));
    expect(widget.verifyOtpCode).toHaveBeenCalledWith("1234");
    expect(verifyMyEmail).toHaveBeenCalledWith("msg91-email-token");
    // Finishing: it must not look clickable again, nor close.
    expect(screen.getByText("Saving your email…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
  });

  it("keeps Verify disabled until the code is complete, then verifies by itself", async () => {
    const user = userEvent.setup();
    const { onVerified } = renderDialog();
    await sendCode(user);

    const verify = screen.getByRole("button", { name: "Verify" });
    await user.keyboard("123");
    expect(verify).toBeDisabled();
    expect(widget.verifyOtpCode).not.toHaveBeenCalled();
    await user.keyboard("4");
    await waitFor(() => expect(onVerified).toHaveBeenCalledWith(profile));
  });

  it("explains why sending failed, including a skipped human check", async () => {
    const user = userEvent.setup();
    widget.sendOtp.mockRejectedValueOnce({ message: "Invalid email" });
    renderDialog();
    await ready();

    await user.click(screen.getByRole("button", { name: "Send code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email");

    widget.sendOtp.mockRejectedValueOnce({});
    widget.isCaptchaVerified.mockReturnValue(false);
    await user.click(screen.getByRole("button", { name: "Send code" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("I am human")
    );
  });

  it("clears a wrong code and explains it", async () => {
    const user = userEvent.setup();
    widget.verifyOtpCode.mockRejectedValueOnce({ message: "OTP not match" });
    const { onVerified } = renderDialog();
    await sendCode(user);

    await user.keyboard("9999");

    expect(await screen.findByRole("alert")).toHaveTextContent("OTP not match");
    expect(onVerified).not.toHaveBeenCalled();
    await user.keyboard("1");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("lets the learner retry the same code on a network failure", async () => {
    const user = userEvent.setup();
    verifyMyEmail.mockResolvedValueOnce({
      ok: false,
      message: "Could not reach ExamFlex.",
    });
    const { onVerified } = renderDialog();
    await sendCode(user);
    await user.keyboard("1234");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach ExamFlex."
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(onVerified).toHaveBeenCalledWith(profile));
    expect(widget.verifyOtpCode).toHaveBeenCalledTimes(1);
    expect(verifyMyEmail).toHaveBeenCalledTimes(2);
  });

  it("treats a 5xx as retryable too", async () => {
    const user = userEvent.setup();
    verifyMyEmail.mockResolvedValueOnce({
      ok: false,
      status: 503,
      message: "Email verification is temporarily unavailable.",
    });
    renderDialog();
    await sendCode(user);
    await user.keyboard("1234");

    expect(
      await screen.findByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
  });

  it("starts over when the email cannot be used", async () => {
    const user = userEvent.setup();
    verifyMyEmail.mockResolvedValueOnce({
      ok: false,
      status: 409,
      message: "This email belongs to another ExamFlex account.",
    });
    renderDialog();
    await sendCode(user);
    await user.keyboard("1234");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This email belongs to another ExamFlex account."
    );
    expect(screen.getByRole("button", { name: "Send code" })).toBeInTheDocument();
    // The spent captcha is drawn again.
    expect(widget.initOtpWidget).toHaveBeenCalledTimes(2);
  });

  it("counts down, resends by the widget's default channel, then stops", async () => {
    const user = userEvent.setup();
    renderDialog();
    await sendCode(user);

    expect(screen.getByText(/Resend code in 0:0[01]/)).toBeInTheDocument();
    const resend = await screen.findByRole(
      "button",
      { name: "Resend code" },
      { timeout: 3000 }
    );
    await user.click(resend);

    expect(widget.resendOtp).toHaveBeenCalledWith(null);
    expect(await screen.findByText("A new code is on its way.")).toBeInTheDocument();
    expect(
      screen.getByText("Didn’t get it? Try again in a few minutes.")
    ).toBeInTheDocument();
  });

  it("shows why a resend failed", async () => {
    const user = userEvent.setup();
    widget.resendOtp.mockRejectedValueOnce({ message: "Too many attempts" });
    renderDialog();
    await sendCode(user);

    await user.click(
      await screen.findByRole("button", { name: "Resend code" }, { timeout: 3000 })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many attempts");
  });

  it("closes from the close button, the Change email link and Use a different email", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await ready();

    await user.click(screen.getByRole("button", { name: "Use a different email" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await sendCode(user);
    await user.click(screen.getByRole("button", { name: "Change email" }));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("closes on Escape while it is not saving", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await ready();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("offers a retry when email verification cannot load", async () => {
    const user = userEvent.setup();
    widget.loadOtpScript.mockRejectedValueOnce(new Error("blocked"));
    renderDialog();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t load email verification."
    );
    expect(screen.queryByRole("button", { name: "Send code" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await ready();
  });
});
