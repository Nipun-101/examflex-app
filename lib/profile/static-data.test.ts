import { describe, expect, it } from "vitest";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

describe("PROFILE_PAGE_DATA", () => {
  it("ships placeholder contact and snapshot content", () => {
    expect(PROFILE_PAGE_DATA.title).toBe("Your desk");
    expect(PROFILE_PAGE_DATA.user.avatarUrl).toBeNull();
    expect(PROFILE_PAGE_DATA.user.signInMethod).toBe("otp");
    expect(PROFILE_PAGE_DATA.snapshot).toHaveLength(3);
    expect(PROFILE_PAGE_DATA.user.phone).toHaveLength(10);
  });
});

