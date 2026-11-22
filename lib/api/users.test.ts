import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseApiUserProfile } from "@/lib/api/users";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

const baseProfile = {
  id: "u1",
  name: "Ada Lovelace",
  email: "ada@examflex.in",
  role: "user",
  isActive: true,
  createdAt: "2025-09-17T02:30:00.000Z",
  updatedAt: "2025-09-17T02:35:00.000Z",
};

describe("parseApiUserProfile", () => {
  it("reads the verification and onboarding flags", () => {
    expect(
      parseApiUserProfile({
        ...baseProfile,
        phoneVerified: true,
        onboardingCompleted: false,
        profileComplete: false,
      })
    ).toMatchObject({
      phoneVerified: true,
      onboardingCompleted: false,
      profileComplete: false,
    });
  });

  it("leaves the flags unset when the API does not send them", () => {
    const parsed = parseApiUserProfile(baseProfile);
    expect(parsed).not.toHaveProperty("profileComplete");
    expect(parsed).not.toHaveProperty("phoneVerified");
  });

  it("ignores flags that are not booleans", () => {
    const parsed = parseApiUserProfile({
      ...baseProfile,
      phoneVerified: "yes",
      onboardingCompleted: 1,
      profileComplete: null,
    });
    expect(parsed).not.toHaveProperty("profileComplete");
    expect(parsed).not.toHaveProperty("phoneVerified");
    expect(parsed).not.toHaveProperty("onboardingCompleted");
  });

  it("parses a full profile", () => {
    expect(
      parseApiUserProfile({
        ...baseProfile,
        phoneNumber: "+919876543210",
        avatarUrl: "https://lh3.googleusercontent.com/a/photo",
        bio: "Hi",
        membershipTier: "bronze",
        badgesEarnedCount: 2,
        targetExam: { id: "e1", name: "NEET" },
        targetExams: [
          { id: "e1", name: "NEET" },
          { id: "e2", name: "JEE" },
        ],
        location: {
          city: "Pune",
          state: "MH",
          country: "IN",
          timezone: "Asia/Kolkata",
        },
        targetExamDate: "2026-05-01T00:00:00.000Z",
      })
    ).toEqual({
      ...baseProfile,
      phoneNumber: "+919876543210",
      avatarUrl: "https://lh3.googleusercontent.com/a/photo",
      bio: "Hi",
      membershipTier: "bronze",
      badgesEarnedCount: 2,
      targetExam: { id: "e1", name: "NEET" },
      targetExams: [
        { id: "e1", name: "NEET" },
        { id: "e2", name: "JEE" },
      ],
      location: {
        city: "Pune",
        state: "MH",
        country: "IN",
        timezone: "Asia/Kolkata",
      },
      targetExamDate: "2026-05-01T00:00:00.000Z",
    });
  });

  it("rejects invalid payloads", () => {
    expect(parseApiUserProfile(null)).toBeNull();
    expect(parseApiUserProfile({})).toBeNull();
    expect(parseApiUserProfile({ ...baseProfile, name: 1 })).toBeNull();
    expect(
      parseApiUserProfile({ ...baseProfile, createdAt: undefined })
    ).toBeNull();
    expect(
      parseApiUserProfile({ ...baseProfile, isActive: "yes" })
    ).toBeNull();
    expect(
      parseApiUserProfile({ ...baseProfile, email: 1, role: "user" })
    ).toBeNull();
    expect(
      parseApiUserProfile({ ...baseProfile, location: "Pune" })
    ).toEqual(baseProfile);
    expect(
      parseApiUserProfile({
        ...baseProfile,
        location: { city: 1, state: 2, country: 3, timezone: 4 },
      })
    ).toEqual({ ...baseProfile, location: {} });
    expect(
      parseApiUserProfile({
        ...baseProfile,
        targetExams: [{ id: 1 }, { name: "x" }, null],
      })
    ).toEqual(baseProfile);
  });

  it("ignores unknown membership tiers and bad target exams", () => {
    expect(
      parseApiUserProfile({ ...baseProfile, membershipTier: 3 })
    ).toEqual(baseProfile);
    expect(
      parseApiUserProfile({ ...baseProfile, membershipTier: "diamond" })
    ).toEqual(baseProfile);
    expect(
      parseApiUserProfile({
        ...baseProfile,
        targetExams: [{ id: "e1" }, { id: "e2", name: "JEE" }],
        targetExam: { id: 1, name: "NEET" },
      })
    ).toEqual({
      ...baseProfile,
      targetExams: [{ id: "e2", name: "JEE" }],
    });
  });
});

describe("getMyProfile / updateMyProfile", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns profile data on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok", data: baseProfile }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { getMyProfile } = await import("@/lib/api/users");
    const result = await getMyProfile();
    expect(result).toEqual({ ok: true, data: baseProfile });
  });

  it("returns API error messages on failure", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { getMyProfile } = await import("@/lib/api/users");
    const result = await getMyProfile();
    expect(result).toEqual({
      ok: false,
      status: 404,
      message: "Not found",
    });
  });

  it("patches and returns the updated profile", async () => {
    const updated = { ...baseProfile, name: "Ada L." };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok", data: updated }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { updateMyProfile } = await import("@/lib/api/users");
    const result = await updateMyProfile({ name: "Ada L." });
    expect(result).toEqual({ ok: true, data: updated });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/users/me",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Ada L." }),
      })
    );
  });

  it("returns a network failure when fetch throws", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const { getMyProfile, updateMyProfile } = await import("@/lib/api/users");
    const getResult = await getMyProfile();
    expect(getResult.ok).toBe(false);
    if (!getResult.ok) {
      expect(getResult.message).toMatch(/reach ExamFlex/i);
    }

    const patchResult = await updateMyProfile({ name: "Ada" });
    expect(patchResult.ok).toBe(false);
  });

  it("rejects ok responses with invalid profile bodies", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok", data: { id: "x" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { getMyProfile } = await import("@/lib/api/users");
    const result = await getMyProfile();
    expect(result.ok).toBe(false);
  });
});
