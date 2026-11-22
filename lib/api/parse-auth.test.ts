import { describe, expect, it } from "vitest";
import { parseApiMessage, parseAuthResponse } from "@/lib/api/parse-auth";

const validUser = {
  id: "u1",
  name: "Ada",
  email: "ada@examflex.in",
  role: "student",
};

describe("parse-auth", () => {
  it("parses a full auth response", () => {
    expect(
      parseAuthResponse({
        message: "ok",
        data: {
          accessToken: "tok",
          isNewUser: true,
          user: { ...validUser, phoneNumber: "+911234567890" },
        },
      })
    ).toEqual({
      accessToken: "tok",
      isNewUser: true,
      user: { ...validUser, phoneNumber: "+911234567890" },
    });

    expect(
      parseAuthResponse({
        data: {
          accessToken: "tok",
          isNewUser: false,
          user: validUser,
        },
      })
    ).toEqual({
      accessToken: "tok",
      isNewUser: false,
      user: validUser,
    });
  });

  it("rejects invalid envelopes", () => {
    expect(parseAuthResponse(null)).toBeNull();
    expect(parseAuthResponse({})).toBeNull();
    expect(parseAuthResponse({ data: { accessToken: "x" } })).toBeNull();
    expect(
      parseAuthResponse({
        data: { accessToken: "x", user: { id: 1 } },
      })
    ).toBeNull();
    expect(
      parseAuthResponse({
        data: {
          accessToken: "x",
          user: { id: "1", name: "Ada", email: 1, role: "student" },
        },
      })
    ).toBeNull();
    expect(
      parseAuthResponse({
        data: {
          accessToken: "",
          user: validUser,
        },
      })
    ).toBeNull();
  });

  it("parses API messages", () => {
    expect(parseApiMessage({ message: " hi " })).toBe("hi");
    expect(parseApiMessage({ message: "   " })).toBeNull();
    expect(parseApiMessage({ message: 1 })).toBeNull();
    expect(parseApiMessage(null)).toBeNull();
  });
});
