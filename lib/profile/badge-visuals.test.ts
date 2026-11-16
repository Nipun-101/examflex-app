import { Award, Flame, Star } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  badgeVisualFor,
  formatMembershipTier,
} from "@/lib/profile/badge-visuals";

describe("badgeVisualFor", () => {
  it("resolves by id then category", () => {
    expect(badgeVisualFor("first-test", "Milestone").Icon).toBe(Star);
    expect(badgeVisualFor("unknown", "Consistency").Icon).toBe(Flame);
    expect(badgeVisualFor("unknown", "Other").Icon).toBe(Award);
  });
});

describe("formatMembershipTier", () => {
  it("formats tiers for display", () => {
    expect(formatMembershipTier("none")).toBe("Starter");
    expect(formatMembershipTier("bronze")).toBe("Bronze");
    expect(formatMembershipTier("")).toBe("Starter");
  });
});
