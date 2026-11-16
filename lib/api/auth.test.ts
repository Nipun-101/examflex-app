import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  exchangeGoogleCode,
  logoutSession,
  refreshSession,
  verifyOtp,
} from "@/lib/api/auth";

const validBody = {
  message: "ok",
  data: {
    accessToken: "access",
    expiresIn: 900,
    isNewUser: false,
    user: {
      id: "1",
      name: "Student",
      email: "s@examflex.in",
      role: "student",
    },
  },
};

describe("api auth", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("verifies OTP successfully", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(validBody), { status: 200 })
    );
    await expect(verifyOtp("msg91-token")).resolves.toEqual({
      ok: true,
      data: {
        accessToken: "access",
        expiresIn: 900,
        isNewUser: false,
        user: validBody.data.user,
      },
    });
  });

  it("returns failure messages for bad OTP responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
      })
    );
    await expect(verifyOtp("bad")).resolves.toEqual({
      ok: false,
      status: 401,
      message: "Invalid token",
    });

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 401 })
    );
    await expect(verifyOtp("bad")).resolves.toEqual({
      ok: false,
      status: 401,
      message: "Authentication failed. Please try again.",
    });
  });

  it("exchanges Google code and refreshes sessions", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(validBody), { status: 200 })
      )
    );
    await expect(
      exchangeGoogleCode({
        code: "c",
        redirectUri: "http://localhost:3002",
        codeVerifier: "v".repeat(43),
      })
    ).resolves.toMatchObject({ ok: true });
    await expect(refreshSession()).resolves.toMatchObject({ ok: true });
  });

  it("handles network failures", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    await expect(verifyOtp("x")).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/Could not reach ExamFlex/),
    });
  });

  it("treats invalid JSON bodies as auth failures", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("not-json", { status: 200 })
    );
    await expect(verifyOtp("x")).resolves.toMatchObject({
      ok: false,
      message: "Authentication failed. Please try again.",
    });
  });

  it("logs out best-effort", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
    await expect(logoutSession("tok")).resolves.toEqual({ ok: true });

    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    await expect(logoutSession(null)).resolves.toEqual({ ok: false });
  });
});
