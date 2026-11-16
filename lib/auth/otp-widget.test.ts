import { describe, expect, it } from "vitest";
import {
  extractMsg91AccessToken,
  isOtpCancelled,
  otpErrorMessage,
} from "@/lib/auth/otp-widget";

describe("otp-widget helpers", () => {
  it("detects cancelled OTP flows", () => {
    expect(isOtpCancelled({ closeByUser: true })).toBe(true);
    expect(isOtpCancelled({ message: "User cancelled" })).toBe(true);
    expect(isOtpCancelled({ type: "cancel" })).toBe(true);
    expect(isOtpCancelled({ message: "invalid" })).toBe(false);
    expect(isOtpCancelled(null)).toBe(false);
  });

  it("formats OTP error messages", () => {
    expect(otpErrorMessage({ message: " Bad code " })).toBe("Bad code");
    expect(otpErrorMessage({})).toMatch(/didn’t match/);
    expect(otpErrorMessage(null)).toMatch(/didn’t match/);
    expect(otpErrorMessage("x")).toMatch(/didn’t match/);
  });

  it("extracts MSG91 access tokens", () => {
    expect(extractMsg91AccessToken({ message: " tok " })).toBe("tok");
    expect(extractMsg91AccessToken({ message: "" })).toBeNull();
    expect(extractMsg91AccessToken(null)).toBeNull();
  });
});
