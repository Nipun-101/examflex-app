import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_OTP_SETTINGS,
  extractMsg91AccessToken,
  initOtpWidget,
  isCaptchaVerified,
  loadOtpScript,
  otpErrorMessage,
  readWidgetSettings,
  resendOtp,
  resetOtpWidgetForTests,
  sendOtp,
  toWidgetIdentifier,
  verifyOtpCode,
  waitForOtpMethods,
} from "@/lib/auth/otp-widget";

function clearWidget() {
  delete window.initSendOTP;
  delete window.sendOtp;
  delete window.verifyOtp;
  delete window.retryOtp;
  delete window.getWidgetData;
  delete window.isCaptchaVerified;
}

describe("otp-widget", () => {
  beforeEach(() => {
    clearWidget();
    resetOtpWidgetForTests();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    clearWidget();
  });

  describe("loading and starting", () => {
    it("resolves immediately when the script is already present", async () => {
      window.initSendOTP = vi.fn();
      const append = vi.spyOn(document.body, "appendChild");
      await expect(loadOtpScript()).resolves.toBeUndefined();
      expect(append).not.toHaveBeenCalled();
    });

    it("injects the MSG91 script once and shares the promise", async () => {
      const first = loadOtpScript();
      const second = loadOtpScript();
      const scripts = document.querySelectorAll("script");
      expect(scripts).toHaveLength(1);
      expect(scripts[0]?.src).toBe("https://verify.msg91.com/otp-provider.js");
      scripts[0]?.onload?.(new Event("load"));
      await expect(first).resolves.toBeUndefined();
      await expect(second).resolves.toBeUndefined();
    });

    it("rejects, and allows a retry, when the script cannot load", async () => {
      const failed = loadOtpScript();
      document.querySelector("script")?.onerror?.(new Event("error"));
      await expect(failed).rejects.toThrow(/load phone verification/i);
      expect(document.querySelectorAll("script")).toHaveLength(0);

      const retry = loadOtpScript();
      expect(document.querySelectorAll("script")).toHaveLength(1);
      document.querySelector("script")?.onload?.(new Event("load"));
      await expect(retry).resolves.toBeUndefined();
    });

    it("starts the widget in custom-UI mode and clears an old captcha", () => {
      process.env.NEXT_PUBLIC_MSG91_WIDGET_ID = "widget-1";
      process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH = "token-1";
      const init = vi.fn();
      window.initSendOTP = init;
      document.body.innerHTML = '<div id="captcha"><iframe></iframe></div>';

      initOtpWidget("captcha");

      expect(document.getElementById("captcha")?.innerHTML).toBe("");
      const config = init.mock.calls[0]?.[0];
      expect(config).toMatchObject({
        widgetId: "widget-1",
        tokenAuth: "token-1",
        identifier: "",
        exposeMethods: true,
        captchaRenderId: "captcha",
      });
      // Config-level callbacks must do nothing, or events would fire twice.
      expect(config.success({ message: "x" })).toBeUndefined();
      expect(config.failure({ message: "x" })).toBeUndefined();
    });

    it("throws when the widget script is not available", () => {
      expect(() => initOtpWidget("captcha")).toThrow(/not available/i);
    });

    it("waits for the methods to appear, then gives up after the timeout", async () => {
      vi.useFakeTimers();
      const ready = waitForOtpMethods(1000);
      window.setTimeout(() => {
        window.sendOtp = vi.fn();
        window.verifyOtp = vi.fn();
        window.retryOtp = vi.fn();
      }, 200);
      await vi.advanceTimersByTimeAsync(300);
      await expect(ready).resolves.toBeUndefined();

      clearWidget();
      const never = waitForOtpMethods(500);
      const assertion = expect(never).rejects.toThrow(/did not start/i);
      await vi.advanceTimersByTimeAsync(700);
      await assertion;
    });
  });

  describe("settings", () => {
    it("falls back to defaults when the widget reports nothing", () => {
      expect(readWidgetSettings()).toEqual(DEFAULT_OTP_SETTINGS);
      window.getWidgetData = () => {
        throw new Error("boom");
      };
      expect(readWidgetSettings()).toEqual(DEFAULT_OTP_SETTINGS);
      window.getWidgetData = () => null;
      expect(readWidgetSettings()).toEqual(DEFAULT_OTP_SETTINGS);
    });

    it("reads length and resend rules from the widget", () => {
      window.getWidgetData = () => ({
        otpLength: 6,
        retryTime: 30,
        retryCount: 3,
      });
      expect(readWidgetSettings()).toEqual({
        otpLength: 6,
        retryTimeSec: 30,
        retryCount: 3,
      });
    });

    it("ignores nonsense values", () => {
      window.getWidgetData = () => ({
        otpLength: 99,
        retryTime: "soon",
        retryCount: -1,
      });
      expect(readWidgetSettings()).toEqual(DEFAULT_OTP_SETTINGS);
    });

    it("reports captcha state without throwing", () => {
      expect(isCaptchaVerified()).toBeUndefined();
      window.isCaptchaVerified = () => true;
      expect(isCaptchaVerified()).toBe(true);
      window.isCaptchaVerified = () => {
        throw new Error("boom");
      };
      expect(isCaptchaVerified()).toBeUndefined();
    });

    it("formats the number the way MSG91 expects", () => {
      expect(toWidgetIdentifier("98765 43210")).toBe("919876543210");
    });
  });

  describe("sending, resending and verifying", () => {
    it("sends and resolves on success, rejects with the widget's error", async () => {
      window.sendOtp = vi.fn((_id, ok) => ok?.({ message: "req", type: "success" }));
      await expect(sendOtp("919876543210")).resolves.toBeUndefined();
      expect(window.sendOtp).toHaveBeenCalledWith(
        "919876543210",
        expect.any(Function),
        expect.any(Function)
      );

      window.sendOtp = vi.fn((_id, _ok, fail) => fail?.({ message: "Captcha not verified" }));
      await expect(sendOtp("919876543210")).rejects.toEqual({
        message: "Captcha not verified",
      });
    });

    it("rejects clearly when the widget is not ready", async () => {
      await expect(sendOtp("91")).rejects.toMatchObject({ message: expect.stringMatching(/not ready/i) });
      await expect(resendOtp()).rejects.toMatchObject({ message: expect.stringMatching(/not ready/i) });
      await expect(verifyOtpCode("1234")).rejects.toMatchObject({ message: expect.stringMatching(/not ready/i) });
    });

    it("resends over the default channel", async () => {
      window.retryOtp = vi.fn((_channel, ok) => ok?.({ type: "success" }));
      await expect(resendOtp()).resolves.toBeUndefined();
      expect(window.retryOtp).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Function));
    });

    it("returns the access token MSG91 puts in `message`", async () => {
      window.verifyOtp = vi.fn((_code, ok) => ok?.({ message: " jwt.token.value ", type: "success" }));
      await expect(verifyOtpCode("1234")).resolves.toBe("jwt.token.value");
    });

    it("rejects when verification succeeds without a token", async () => {
      window.verifyOtp = vi.fn((_code, ok) => ok?.({ type: "success" }));
      await expect(verifyOtpCode("1234")).rejects.toMatchObject({
        message: expect.stringMatching(/could not confirm/i),
      });
    });

    it("rejects with the widget's reason for a wrong code", async () => {
      window.verifyOtp = vi.fn((_code, _ok, fail) => fail?.({ message: "OTP not match" }));
      await expect(verifyOtpCode("0000")).rejects.toEqual({ message: "OTP not match" });
    });

    it("turns a thrown error into a rejection", async () => {
      window.sendOtp = vi.fn(() => {
        throw new Error("sync boom");
      });
      await expect(sendOtp("91")).rejects.toThrow("sync boom");
    });

    it("gives up if the widget never calls back, and ignores late callbacks", async () => {
      vi.useFakeTimers();
      let late: ((value: unknown) => void) | undefined;
      window.sendOtp = vi.fn((_id, ok) => {
        late = ok;
      });
      const pending = sendOtp("919876543210");
      const assertion = expect(pending).rejects.toMatchObject({
        message: expect.stringMatching(/too long/i),
      });
      await vi.advanceTimersByTimeAsync(26_000);
      await assertion;
      expect(() => late?.({ type: "success" })).not.toThrow();
    });
  });

  describe("message helpers", () => {
    it("extracts the access token", () => {
      expect(extractMsg91AccessToken({ message: " tok " })).toBe("tok");
      expect(extractMsg91AccessToken({ message: "  " })).toBeNull();
      expect(extractMsg91AccessToken({})).toBeNull();
      expect(extractMsg91AccessToken(null)).toBeNull();
    });

    it("builds readable error messages from any shape", () => {
      expect(otpErrorMessage({ message: " Bad code " })).toBe("Bad code");
      expect(otpErrorMessage("plain text")).toBe("plain text");
      expect(otpErrorMessage({})).toMatch(/didn’t work/);
      expect(otpErrorMessage(null, "fallback")).toBe("fallback");
    });
  });
});
