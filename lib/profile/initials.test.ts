import { describe, expect, it } from "vitest";
import { profileInitials } from "@/lib/profile/initials";

describe("profileInitials", () => {
  it("returns EF for blank names", () => {
    expect(profileInitials("")).toBe("EF");
    expect(profileInitials("   ")).toBe("EF");
  });

  it("uses one letter for a single word", () => {
    expect(profileInitials("Aarav")).toBe("A");
  });

  it("uses first and last initials for multi-word names", () => {
    expect(profileInitials("Aarav Mehta")).toBe("AM");
    expect(profileInitials("  aarav   kumar  mehta ")).toBe("AM");
  });
});
