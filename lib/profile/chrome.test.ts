import { describe, expect, it } from "vitest";
import { profileChromeFromPageData } from "@/lib/profile/chrome";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

describe("profileChromeFromPageData", () => {
  it("strips user/snapshot into chrome-only props", () => {
    const chrome = profileChromeFromPageData(PROFILE_PAGE_DATA);
    expect(chrome.title).toBe("Your desk");
    expect(chrome.examBadge).toBe("examflex");
    expect(chrome).not.toHaveProperty("user");
    expect(chrome).not.toHaveProperty("snapshot");
  });
});
