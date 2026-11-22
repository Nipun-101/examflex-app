import { describe, expect, it } from "vitest";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

describe("PROFILE_PAGE_DATA", () => {
  it("ships chrome copy and fixture identity without NEET branding", () => {
    expect(PROFILE_PAGE_DATA.title).toBe("Your desk");
    expect(PROFILE_PAGE_DATA.examBadge).toBe("examflex");
    expect(PROFILE_PAGE_DATA.user.avatarUrl).toBeNull();
    expect(PROFILE_PAGE_DATA.user.signInMethod).toBe("otp");
    expect(PROFILE_PAGE_DATA.user.examTrack).toBe("ExamFlex");
    expect(PROFILE_PAGE_DATA.user.phoneLocked).toBe(true);
    expect(PROFILE_PAGE_DATA.user.emailLocked).toBe(true);
    expect(PROFILE_PAGE_DATA.snapshot).toEqual([]);
    expect(PROFILE_PAGE_DATA.user.phone).toHaveLength(10);
  });
});
