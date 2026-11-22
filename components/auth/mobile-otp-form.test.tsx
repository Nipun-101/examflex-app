import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as OtpWidget from "@/lib/auth/otp-widget";
import {
  MobileOtpForm,
  normalizeMobile,
  type OtpVerifiedOutcome,
} from "@/components/auth/mobile-otp-form";

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
    resendOtp: () => widget.resendOtp(),
    verifyOtpCode: (...args: unknown[]) => widget.verifyOtpCode(...args),
    isCaptchaVerified: () => widget.isCaptchaVerified(),
  };
});

const SETTINGS = { otpLength: 4, retryTimeSec: 1, retryCount: 2 };

async function renderReady(
  onVerified: (t: string, m: string) => Promise<OtpVerifiedOutcome> = async () => ({ ok: true }),
  props: Partial<React.ComponentProps<typeof MobileOtpForm>> = {}
) {
  render(<MobileOtpForm theme="landing" onVerified={onVerified} {...props} />);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
  );
}

async function sendTo(user: ReturnType<typeof userEvent.setup>, number: string) {
  await user.type(screen.getByLabelText("Mobile number"), number);
  await user.click(screen.getByRole("button", { name: "Send code" }));
  await screen.findByText(/Enter the 4-digit code/);
}

describe("MobileOtpForm", () => {
  beforeEach(() => {
    Object.values(widget).forEach((fn) => fn.mockReset());
    widget.loadOtpScript.mockResolvedValue(undefined);
    widget.waitForOtpMethods.mockResolvedValue(undefined);
    widget.readWidgetSettings.mockReturnValue(SETTINGS);
    widget.sendOtp.mockResolvedValue(undefined);
    widget.resendOtp.mockResolvedValue(undefined);
    widget.verifyOtpCode.mockResolvedValue("msg91-access-token");
    widget.isCaptchaVerified.mockReturnValue(true);
  });

  afterEach(cleanup);

  describe("starting up", () => {
    it("shows a preparing state until the widget is ready, then starts it once", async () => {
      let release: () => void = () => undefined;
      widget.waitForOtpMethods.mockReturnValue(
        new Promise<void>((resolve) => {
          release = resolve;
        })
      );
      render(<MobileOtpForm theme="landing" onVerified={async () => ({ ok: true })} />);
      expect(screen.getByRole("button", { name: /Getting ready/ })).toBeDisabled();
      release();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
      );
      expect(widget.initOtpWidget).toHaveBeenCalledWith("msg91-captcha");
    });

    it("offers a retry when the widget cannot load, and recovers", async () => {
      const user = userEvent.setup();
      widget.loadOtpScript.mockRejectedValueOnce(new Error("blocked"));
      render(<MobileOtpForm theme="study" onVerified={async () => ({ ok: true })} />);
      expect(await screen.findByRole("alert")).toHaveTextContent(/couldn’t load phone verification/i);
      await user.click(screen.getByRole("button", { name: "Try again" }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
      );
    });

    it("prefills a known number", async () => {
      await renderReady(undefined, { initialMobile: "9876543210" });
      expect(screen.getByLabelText("Mobile number")).toHaveValue("9876543210");
    });
  });

  describe("number step", () => {
    it.each([["12345"], ["5876543210"], ["abcdefghij"]])(
      "rejects %s without calling the widget",
      async (value) => {
        const user = userEvent.setup();
        await renderReady();
        if (value) await user.type(screen.getByLabelText("Mobile number"), value);
        await user.click(screen.getByRole("button", { name: "Send code" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/valid 10-digit mobile number/i);
        expect(widget.sendOtp).not.toHaveBeenCalled();
      }
    );

    it("accepts pasted +91 / leading-zero formats", () => {
      expect(normalizeMobile("+91 98765 43210")).toBe("9876543210");
      expect(normalizeMobile("098765 43210")).toBe("9876543210");
      expect(normalizeMobile("9876543210")).toBe("9876543210");
    });

    it("sends the code using MSG91's country-code format", async () => {
      const user = userEvent.setup();
      await renderReady();
      await sendTo(user, "98765 43210");
      expect(widget.sendOtp).toHaveBeenCalledWith("919876543210");
      expect(screen.getByText(/Sent to \+91 98765 43210/)).toBeInTheDocument();
    });

    it("shows the widget's reason when sending fails", async () => {
      const user = userEvent.setup();
      widget.sendOtp.mockRejectedValue({ message: "Too many attempts" });
      await renderReady();
      await user.type(screen.getByLabelText("Mobile number"), "9876543210");
      await user.click(screen.getByRole("button", { name: "Send code" }));
      expect(await screen.findByRole("alert")).toHaveTextContent("Too many attempts");
      expect(screen.getByLabelText("Mobile number")).toBeEnabled();
    });

    it("tells the learner to tick the human check when it was skipped", async () => {
      const user = userEvent.setup();
      widget.sendOtp.mockRejectedValue({ message: "captcha" });
      widget.isCaptchaVerified.mockReturnValue(false);
      await renderReady();
      await user.type(screen.getByLabelText("Mobile number"), "9876543210");
      await user.click(screen.getByRole("button", { name: "Send code" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(/tick “I am human”/);
    });
  });

  describe("code step", () => {
    it("verifies automatically on the last digit and hands over the token", async () => {
      const user = userEvent.setup();
      const onVerified = vi.fn().mockResolvedValue({ ok: true });
      await renderReady(onVerified);
      await sendTo(user, "9876543210");
      await user.type(screen.getByLabelText("4-digit verification code"), "3923");
      await waitFor(() =>
        expect(onVerified).toHaveBeenCalledWith("msg91-access-token", "9876543210")
      );
      expect(widget.verifyOtpCode).toHaveBeenCalledWith("3923");
    });

    it("stays in a non-clickable finishing state after success", async () => {
      const user = userEvent.setup();
      await renderReady(async () => ({ ok: true }), { finishingLabel: "Signing you in…" });
      await sendTo(user, "9876543210");
      await user.type(screen.getByLabelText("4-digit verification code"), "3923");
      expect(await screen.findByText("Signing you in…")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Verify" })).toBeDisabled();
    });

    it("clears the code and explains a wrong code, then allows another try", async () => {
      const user = userEvent.setup();
      widget.verifyOtpCode.mockRejectedValueOnce({ message: "OTP not match" });
      const onVerified = vi.fn().mockResolvedValue({ ok: true });
      await renderReady(onVerified);
      await sendTo(user, "9876543210");
      const input = screen.getByLabelText("4-digit verification code");
      await user.type(input, "0000");
      expect(await screen.findByRole("alert")).toHaveTextContent("OTP not match");
      expect(input).toHaveValue("");
      expect(onVerified).not.toHaveBeenCalled();

      await user.type(input, "3923");
      await waitFor(() => expect(onVerified).toHaveBeenCalled());
    });

    it("keeps Verify disabled until the code is complete", async () => {
      const user = userEvent.setup();
      await renderReady();
      await sendTo(user, "9876543210");
      expect(screen.getByRole("button", { name: "Verify" })).toBeDisabled();
      await user.type(screen.getByLabelText("4-digit verification code"), "12");
      expect(screen.getByRole("button", { name: "Verify" })).toBeDisabled();
    });

    it("goes back to the number step from Change number and re-renders the captcha", async () => {
      const user = userEvent.setup();
      await renderReady();
      await sendTo(user, "9876543210");
      widget.initOtpWidget.mockClear();
      await user.click(screen.getByRole("button", { name: "Change number" }));
      expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
      expect(widget.initOtpWidget).toHaveBeenCalledWith("msg91-captcha");
    });
  });

  describe("after the code is verified", () => {
    it("lets the learner retry the same code on a transient failure", async () => {
      const user = userEvent.setup();
      const onVerified = vi
        .fn<(t: string, m: string) => Promise<OtpVerifiedOutcome>>()
        .mockResolvedValueOnce({ ok: false, retryable: true, message: "Network trouble." })
        .mockResolvedValueOnce({ ok: true });
      await renderReady(onVerified);
      await sendTo(user, "9876543210");
      await user.type(screen.getByLabelText("4-digit verification code"), "3923");
      expect(await screen.findByText("Network trouble.")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Try again" }));
      await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(2));
      // The same verified token is reused; no new code was requested.
      expect(onVerified.mock.calls[1]?.[0]).toBe("msg91-access-token");
      expect(widget.verifyOtpCode).toHaveBeenCalledTimes(1);
    });

    it("sends the learner back to the number step when the number cannot be used", async () => {
      const user = userEvent.setup();
      const onVerified = vi.fn().mockResolvedValue({
        ok: false,
        retryable: false,
        message: "This mobile number is already linked to another account.",
      });
      await renderReady(onVerified);
      await sendTo(user, "9876543210");
      widget.initOtpWidget.mockClear();
      await user.type(screen.getByLabelText("4-digit verification code"), "3923");

      expect(await screen.findByRole("alert")).toHaveTextContent(/already linked to another account/);
      expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
      expect(widget.initOtpWidget).toHaveBeenCalled();
    });

    it("offers a different number instead of retrying", async () => {
      const user = userEvent.setup();
      const onVerified = vi
        .fn()
        .mockResolvedValue({ ok: false, retryable: true, message: "Try later." });
      await renderReady(onVerified);
      await sendTo(user, "9876543210");
      await user.type(screen.getByLabelText("4-digit verification code"), "3923");
      await screen.findByText("Try later.");
      await user.click(screen.getByRole("button", { name: "Use a different number" }));
      expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
    });
  });

  describe("resending", () => {
    it("counts down, then resends, then stops after the allowed retries", async () => {
      const user = userEvent.setup();
      widget.readWidgetSettings.mockReturnValue({ otpLength: 4, retryTimeSec: 1, retryCount: 1 });
      await renderReady();
      await sendTo(user, "9876543210");
      expect(screen.getByText(/Resend code in 0:0\d/)).toBeInTheDocument();

      const resend = await screen.findByRole("button", { name: "Resend code" }, { timeout: 3000 });
      await user.click(resend);
      expect(widget.resendOtp).toHaveBeenCalledTimes(1);
      expect(await screen.findByText("A new code is on its way.")).toBeInTheDocument();
      expect(
        screen.getByText(/Change the number, or try again in a few minutes/)
      ).toBeInTheDocument();
    });

    it("shows why a resend failed and keeps the option open", async () => {
      const user = userEvent.setup();
      widget.resendOtp.mockRejectedValueOnce({ message: "Retry limit reached" });
      await renderReady();
      await sendTo(user, "9876543210");
      await user.click(await screen.findByRole("button", { name: "Resend code" }, { timeout: 3000 }));
      expect(await screen.findByRole("alert")).toHaveTextContent("Retry limit reached");
      expect(screen.getByRole("button", { name: "Resend code" })).toBeInTheDocument();
    });
  });

  describe("inside another form (onboarding)", () => {
    function renderInsideForm() {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      const view = render(
        <form onSubmit={onSubmit} data-testid="outer">
          <MobileOtpForm theme="study" onVerified={async () => ({ ok: true })} />
          <button type="submit">Continue</button>
        </form>
      );
      return { onSubmit, ...view };
    }

    it("never renders a form of its own, so forms are not nested", async () => {
      const user = userEvent.setup();
      const { container } = renderInsideForm();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
      );
      expect(container.querySelectorAll("form form")).toHaveLength(0);
      expect(container.querySelectorAll("form")).toHaveLength(1);

      await user.type(screen.getByLabelText("Mobile number"), "9876543210");
      await user.click(screen.getByRole("button", { name: "Send code" }));
      await screen.findByText(/Enter the 4-digit code/);
      expect(container.querySelectorAll("form")).toHaveLength(1);
    });

    it("sends the code on Enter without submitting the surrounding form", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderInsideForm();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
      );
      await user.type(screen.getByLabelText("Mobile number"), "9876543210{Enter}");
      await screen.findByText(/Enter the 4-digit code/);
      expect(widget.sendOtp).toHaveBeenCalledWith("919876543210");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does not submit the surrounding form when Enter is pressed in the code box", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderInsideForm();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
      );
      await user.type(screen.getByLabelText("Mobile number"), "9876543210{Enter}");
      await screen.findByText(/Enter the 4-digit code/);
      await user.type(screen.getByLabelText("4-digit verification code"), "12{Enter}");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("still validates the number when Enter is pressed", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderInsideForm();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Send code" })).toBeEnabled()
      );
      await user.type(screen.getByLabelText("Mobile number"), "123{Enter}");
      expect(await screen.findByRole("alert")).toHaveTextContent(/valid 10-digit/i);
      expect(widget.sendOtp).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("the human check (hCaptcha) layout", () => {
    // The widget is a fixed ~303px box; these tests pin how we make it fit.
    const instances: Array<{ callback: () => void }> = [];
    class FakeResizeObserver {
      callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
        instances.push(this);
      }
      observe() {}
      disconnect() {}
    }
    let availableWidth = 400;
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");

    beforeEach(() => {
      instances.length = 0;
      availableWidth = 400;
      vi.stubGlobal("ResizeObserver", FakeResizeObserver);
      Object.defineProperty(HTMLElement.prototype, "clientWidth", {
        configurable: true,
        get: () => availableWidth,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      if (original) Object.defineProperty(HTMLElement.prototype, "clientWidth", original);
    });

    const captcha = () => document.getElementById("msg91-captcha") as HTMLElement;
    const remeasure = () =>
      act(() => {
        instances.forEach((instance) => instance.callback());
      });

    it("sits between the number field and the Send button, in document order too", async () => {
      await renderReady();
      const input = screen.getByLabelText("Mobile number");
      const send = screen.getByRole("button", { name: "Send code" });
      const follows = (a: Node, b: Node) =>
        Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      expect(follows(input, captcha())).toBe(true);
      expect(follows(captcha(), send)).toBe(true);
    });

    it("keeps its natural size when there is room", async () => {
      await renderReady();
      availableWidth = 420;
      remeasure();
      expect(captcha().style.transform).toContain("scale(1)");
    });

    it("scales down to fit a narrow card instead of overflowing it", async () => {
      await renderReady();
      availableWidth = 200; // a phone-width onboarding card
      remeasure();
      const scale = Number(/scale\(([\d.]+)\)/.exec(captcha().style.transform)?.[1]);
      expect(scale).toBeCloseTo(200 / 304, 3);
      // scaled width fits inside what it was given
      expect(304 * scale).toBeLessThanOrEqual(200 + 0.5);
      // and the box reserves only the scaled height, so no gap is left behind
      expect(parseFloat((captcha().parentElement as HTMLElement).style.height)).toBeLessThan(78);
    });

    it("never shrinks below a still-usable size", async () => {
      await renderReady();
      availableWidth = 60;
      remeasure();
      expect(captcha().style.transform).toContain("scale(0.5)");
    });

    it("ignores a measurement taken while it is hidden", async () => {
      await renderReady();
      availableWidth = 200;
      remeasure();
      const before = captcha().style.transform;
      availableWidth = 0; // display: none reports a zero width
      remeasure();
      expect(captcha().style.transform).toBe(before);
    });

    it("stays mounted (only hidden) once the code step is showing, because MSG91 keeps a reference to it", async () => {
      const user = userEvent.setup();
      await renderReady();
      const node = captcha();
      await sendTo(user, "9876543210");
      expect(document.getElementById("msg91-captcha")).toBe(node);
      expect((node.parentElement as HTMLElement).className).toContain("hidden");
    });

    it("is hidden, not shown, when phone verification could not load", async () => {
      widget.loadOtpScript.mockRejectedValueOnce(new Error("blocked"));
      render(<MobileOtpForm theme="study" onVerified={async () => ({ ok: true })} />);
      await screen.findByRole("alert");
      expect((captcha().parentElement as HTMLElement).className).toContain("hidden");
    });

    it("works without ResizeObserver (older browsers): natural size, nothing breaks", async () => {
      vi.stubGlobal("ResizeObserver", undefined);
      await renderReady();
      expect(captcha().style.transform).toContain("scale(1)");
    });
  });

  it("renders with the study theme as well", async () => {
    await renderReady(undefined, { theme: "study" });
    expect(screen.getByText("+91")).toBeInTheDocument();
  });
});
