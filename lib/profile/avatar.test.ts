import { describe, expect, it } from "vitest";
import { resolveProfileAvatarUrl } from "@/lib/profile/avatar";

describe("resolveProfileAvatarUrl", () => {
  it("returns the Google photo for Google sessions", () => {
    expect(
      resolveProfileAvatarUrl("google", "https://lh3.googleusercontent.com/a/photo")
    ).toBe("https://lh3.googleusercontent.com/a/photo");
  });

  it("returns null when Google has no photo yet", () => {
    expect(resolveProfileAvatarUrl("google", null)).toBeNull();
  });

  it("always falls back for mobile OTP sessions", () => {
    expect(
      resolveProfileAvatarUrl("otp", "https://lh3.googleusercontent.com/a/photo")
    ).toBeNull();
  });
});
