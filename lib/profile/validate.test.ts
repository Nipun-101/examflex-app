import { describe, expect, it } from "vitest";
import {
  emailVerifyError,
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
    expect(
      validateProfileContact({ name: " ", phone: "9876543210", email: "a@b.co" })
        .name
    ).toBe("Add your name.");
    expect(
      validateProfileContact({ name: "A", phone: "9876543210", email: "a@b.co" })
        .name
    ).toBe("Name needs at least 2 characters.");
  });

  it("applies the same name rules as the API, including hostile input", () => {
    const contact = (name: string) => ({
      name,
      phone: "9876543210",
      email: "a@b.co",
    });
    expect(validateProfileContact(contact("Rahul K.")).name).toBeUndefined();
    expect(validateProfileContact(contact("Jos\u00e9 Garc\u00eda")).name).toBeUndefined();
    expect(validateProfileContact(contact("<script>alert(1)</script>")).name).toMatch(
      /letters, numbers, spaces/
    );
    expect(validateProfileContact(contact("Rahul`id`")).name).toMatch(
      /letters, numbers, spaces/
    );
    expect(validateProfileContact(contact("www.evil.com")).name).toMatch(
      /web address/
    );
    // invisible characters are cleaned, not blamed on the learner
    expect(
      validateProfileContact(contact(`Ra${String.fromCodePoint(0x200b)}hul`)).name
    ).toBeUndefined();
  });

  it("allows empty phone when unlocked and validates partial digits", () => {
    expect(
      validateProfileContact(
        { name: "Aa", phone: "", email: "a@b.co" },
        { phoneLocked: false }
      )
    ).toEqual({});
    expect(
      validateProfileContact(
        { name: "Aa", phone: "12345", email: "a@b.co" },
        { phoneLocked: false }
      ).phone
    ).toBe("Use a 10-digit Indian mobile number.");
  });

  it("never validates the email: Save does not send it", () => {
    for (const email of ["", " ", "nope", "legacy-odd@address"]) {
      expect(
        validateProfileContact({ name: "Aarav Mehta", phone: "9876543210", email })
      ).toEqual({});
    }
  });

  it("skips phone validation when locked", () => {
    expect(
      validateProfileContact(
        { name: "Aa", phone: "", email: "a@b.co" },
        { phoneLocked: true }
      )
    ).toEqual({});
  });

});

describe("emailVerifyError", () => {
  it("asks for an address, then a plausible one", () => {
    expect(emailVerifyError("")).toBe("Add an email address.");
    expect(emailVerifyError("   ")).toBe("Add an email address.");
    expect(emailVerifyError("nope")).toBe("That email does not look right.");
    expect(emailVerifyError(" riya@example.com ")).toBeNull();
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
    expect(
      isProfileContactDirty({ ...saved, name: " Aarav Mehta " }, saved)
    ).toBe(false);
    expect(
      isProfileContactDirty({ ...saved, phone: "98765-43210" }, saved)
    ).toBe(false);
    // A typed, unverified email is not something Save can send.
    expect(
      isProfileContactDirty({ ...saved, email: "someone.else@example.com" }, saved)
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
