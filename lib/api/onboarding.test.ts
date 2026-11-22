import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeOnboarding,
  verifyMyEmail,
  verifyMyPhone,
} from "@/lib/api/onboarding";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

const profile = {
  id: "u1",
  name: "Rahul Sharma",
  email: "rahul@gmail.com",
  role: "user",
  isActive: true,
  phoneNumber: "+919876543210",
  phoneVerified: true,
  onboardingCompleted: true,
  profileComplete: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("onboarding api", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("verifyMyPhone", () => {
    it("posts only the access token, never a phone number", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ data: profile }), { status: 200 })
      );
      const result = await verifyMyPhone("msg91-token");

      expect(result).toMatchObject({ ok: true, data: { phoneVerified: true } });
      const [url, init] = vi.mocked(fetch).mock.calls[0]!;
      expect(String(url)).toBe("http://localhost:3000/api/v1/users/me/phone/verify");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ accessToken: "msg91-token" });
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer mem-token");
    });

    it("surfaces the API's reason when the number belongs to someone else", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ message: "This mobile number is already linked to another account." }),
          { status: 409 }
        )
      );
      expect(await verifyMyPhone("t")).toEqual({
        ok: false,
        status: 409,
        message: "This mobile number is already linked to another account.",
      });
    });

    it("uses friendly fallbacks for an empty error body and for network failures", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 500 }));
      expect(await verifyMyPhone("t")).toMatchObject({
        ok: false,
        status: 500,
        message: "We could not verify that number. Please try again.",
      });

      vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
      const offline = await verifyMyPhone("t");
      expect(offline).toMatchObject({ ok: false, message: expect.stringMatching(/Could not reach ExamFlex/) });
      expect((offline as { status?: number }).status).toBeUndefined();
    });
  });

  describe("verifyMyEmail", () => {
    it("posts only the access token, never an email", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ data: { ...profile, emailVerified: true } }),
          { status: 200 }
        )
      );
      const result = await verifyMyEmail("msg91-email-token");

      expect(result).toMatchObject({ ok: true, data: { emailVerified: true } });
      const [url, init] = vi.mocked(fetch).mock.calls[0]!;
      expect(String(url)).toBe("http://localhost:3000/api/v1/users/me/email/verify");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({
        accessToken: "msg91-email-token",
      });
    });

    it("surfaces the API's reason when the email belongs to someone else", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ message: "This email belongs to another ExamFlex account." }),
          { status: 409 }
        )
      );
      expect(await verifyMyEmail("t")).toEqual({
        ok: false,
        status: 409,
        message: "This email belongs to another ExamFlex account.",
      });
    });

    it("uses friendly fallbacks for an empty error body and for network failures", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 500 }));
      expect(await verifyMyEmail("t")).toMatchObject({
        ok: false,
        status: 500,
        message: "We could not verify that email. Please try again.",
      });

      vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
      expect(await verifyMyEmail("t")).toMatchObject({
        ok: false,
        message: expect.stringMatching(/Could not reach ExamFlex/),
      });
    });
  });

  describe("completeOnboarding", () => {
    it("posts the name and the one exam", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ data: profile }), { status: 200 })
      );
      const result = await completeOnboarding({ name: "Rahul Sharma", targetExamId: "e1" });
      expect(result).toMatchObject({ ok: true, data: { profileComplete: true } });
      const [url, init] = vi.mocked(fetch).mock.calls[0]!;
      expect(String(url)).toBe("http://localhost:3000/api/v1/users/me/onboarding");
      expect(JSON.parse(String(init?.body))).toEqual({
        name: "Rahul Sharma",
        targetExamId: "e1",
      });
    });

    it("reports failures with a fallback message", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 403 }));
      expect(await completeOnboarding({ name: "A B", targetExamId: "e" })).toMatchObject({
        ok: false,
        status: 403,
        message: "We could not save your details. Please try again.",
      });

      vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
      expect(await completeOnboarding({ name: "A B", targetExamId: "e" })).toMatchObject({
        ok: false,
      });
    });
  });
});
