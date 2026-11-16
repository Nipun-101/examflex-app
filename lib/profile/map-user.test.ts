import { describe, expect, it } from "vitest";
import {
  buildUpdatePayload,
  displayEmailFromApi,
  displayPhoneFromApi,
  examTrackFromProfile,
  formatMemberSinceLabel,
  inferSignInMethod,
  isTempExamflexEmail,
  mapApiUserToProfileUser,
  toE164IndianMobile,
} from "@/lib/profile/map-user";
import type { ApiUserProfile } from "@/types/user";

const base: ApiUserProfile = {
  id: "u1",
  name: "Ada",
  email: "ada@examflex.in",
  role: "user",
  isActive: true,
  createdAt: "2025-03-15T10:00:00.000Z",
  updatedAt: "2025-03-15T10:00:00.000Z",
};

describe("temp email helpers", () => {
  it("detects and blanks temp OTP emails", () => {
    expect(isTempExamflexEmail("user9198@temp.examflex.com")).toBe(true);
    expect(displayEmailFromApi("user9198@temp.examflex.com")).toBe("");
    expect(displayEmailFromApi("ada@examflex.in")).toBe("ada@examflex.in");
  });
});

describe("phone helpers", () => {
  it("strips +91 for display and rebuilds E.164", () => {
    expect(displayPhoneFromApi("+919876543210")).toBe("9876543210");
    expect(displayPhoneFromApi("9876543210")).toBe("9876543210");
    expect(displayPhoneFromApi("12345")).toBe("12345");
    expect(displayPhoneFromApi(undefined)).toBe("");
    expect(toE164IndianMobile("9876543210")).toBe("+919876543210");
    expect(toE164IndianMobile("919876543210")).toBe("+919876543210");
  });
});

describe("inferSignInMethod", () => {
  it("treats Google avatar hosts as Google sign-in", () => {
    expect(
      inferSignInMethod("https://lh3.googleusercontent.com/a/photo")
    ).toBe("google");
    expect(inferSignInMethod(null)).toBe("otp");
    expect(inferSignInMethod("https://cdn.examflex.in/a.png")).toBe("otp");
  });
});

describe("examTrackFromProfile / memberSince", () => {
  it("prefers targetExam then targetExams then ExamFlex", () => {
    expect(
      examTrackFromProfile({
        ...base,
        targetExam: { id: "1", name: "JEE Main" },
      })
    ).toBe("JEE Main");
    expect(
      examTrackFromProfile({
        ...base,
        targetExams: [{ id: "1", name: "NEET" }],
      })
    ).toBe("NEET");
    expect(examTrackFromProfile(base)).toBe("ExamFlex");
  });

  it("formats member-since labels", () => {
    expect(formatMemberSinceLabel("2025-03-15T10:00:00.000Z")).toBe(
      "On ExamFlex since March 2025"
    );
    expect(formatMemberSinceLabel("not-a-date")).toBe("On ExamFlex");
  });
});

describe("mapApiUserToProfileUser", () => {
  it("maps API fields into the profile view model", () => {
    expect(
      mapApiUserToProfileUser({
        ...base,
        phoneNumber: "+919876543210",
        avatarUrl: "https://lh3.googleusercontent.com/a/photo",
        membershipTier: "silver",
        targetExam: { id: "e1", name: "NEET" },
      })
    ).toEqual({
      name: "Ada",
      phone: "9876543210",
      email: "ada@examflex.in",
      avatarUrl: "https://lh3.googleusercontent.com/a/photo",
      signInMethod: "google",
      examTrack: "NEET",
      memberSinceLabel: "On ExamFlex since March 2025",
      membershipTier: "silver",
      phoneLocked: true,
    });
  });

  it("locks phone only when present and blanks temp email", () => {
    expect(
      mapApiUserToProfileUser({
        ...base,
        email: "user98@temp.examflex.com",
      })
    ).toMatchObject({
      email: "",
      phone: "",
      phoneLocked: false,
      membershipTier: "none",
      signInMethod: "otp",
    });
  });
});

describe("buildUpdatePayload", () => {
  it("sends only changed fields and skips locked phones", () => {
    const saved = {
      name: "Ada",
      phone: "9876543210",
      email: "ada@examflex.in",
    };
    expect(
      buildUpdatePayload(
        { ...saved, name: "Ada L." },
        saved,
        true
      )
    ).toEqual({ name: "Ada L." });

    expect(
      buildUpdatePayload(
        { name: "Ada", phone: "9123456789", email: "ada@examflex.in" },
        { name: "Ada", phone: "", email: "ada@examflex.in" },
        false
      )
    ).toEqual({ phoneNumber: "+919123456789" });

    expect(
      buildUpdatePayload(
        { ...saved, email: "new@examflex.in" },
        saved,
        true
      )
    ).toEqual({ email: "new@examflex.in" });

    expect(buildUpdatePayload(saved, saved, true)).toEqual({});
  });
});
