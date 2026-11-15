import { describe, expect, it } from "vitest";
import {
  hasProfileFieldErrors,
  isProfileContactDirty,
  normalizePhoneDigits,
  sanitizeProfileContact,
  validateProfileContact,
} from "@/lib/profile/validate";

describe("normalizePhoneDigits", () => {
  it("strips non-digits", () => {
    expect(normalizePhoneDigits("+91 98765-43210")).toBe("919876543210");
  });
});

describe("validateProfileContact", () => {
  it("accepts a complete contact", () => {
    expect(
      validateProfileContact({
        name: "Aarav Mehta",
        phone: "9876543210",
        email: "aarav@example.com",
      })
    ).toEqual({});
  });

  it("flags empty and short names", () => {
    expect(validateProfileContact({ name: " ", phone: "9876543210", email: "a@b.co" }).name).toBe(
      "Add your name."
    );
    expect(validateProfileContact({ name: "A", phone: "9876543210", email: "a@b.co" }).name).toBe(
      "Name needs at least 2 characters."
    );
  });

  it("flags phone problems", () => {
    expect(validateProfileContact({ name: "Aa", phone: "", email: "a@b.co" }).phone).toBe(
      "Add a 10-digit mobile number."
    );
    expect(
      validateProfileContact({ name: "Aa", phone: "12345", email: "a@b.co" }).phone
    ).toBe("Use a 10-digit Indian mobile number.");
  });

  it("flags email problems", () => {
    expect(validateProfileContact({ name: "Aa", phone: "9876543210", email: " " }).email).toBe(
      "Add an email address."
    );
    expect(
      validateProfileContact({ name: "Aa", phone: "9876543210", email: "nope" }).email
    ).toBe("That email does not look right.");
  });
});

describe("hasProfileFieldErrors", () => {
  it("detects empty and populated error maps", () => {
    expect(hasProfileFieldErrors({})).toBe(false);
    expect(hasProfileFieldErrors({ name: "x" })).toBe(true);
  });
});

describe("isProfileContactDirty", () => {
  it("compares trimmed normalized values", () => {
    const saved = {
      name: "Aarav Mehta",
      phone: "9876543210",
      email: "aarav@example.com",
    };
    expect(isProfileContactDirty({ ...saved, name: " Aarav Mehta " }, saved)).toBe(
      false
    );
    expect(
      isProfileContactDirty({ ...saved, phone: "98765-43210" }, saved)
    ).toBe(false);
    expect(
      isProfileContactDirty({ ...saved, email: "AARAV@example.com" }, saved)
    ).toBe(false);
    expect(isProfileContactDirty({ ...saved, name: "Riya" }, saved)).toBe(true);
  });
});

describe("sanitizeProfileContact", () => {
  it("trims, collapses spaces, and normalizes phone/email", () => {
    expect(
      sanitizeProfileContact({
        name: "  Aarav   Mehta ",
        phone: "98765-43210",
        email: "Aarav@Example.COM",
      })
    ).toEqual({
      name: "Aarav Mehta",
      phone: "9876543210",
      email: "aarav@example.com",
    });
  });
});
