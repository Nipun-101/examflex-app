import { describe, expect, it } from "vitest";
import { brand } from "@/lib/brand";

describe("brand", () => {
  it("exposes ExamFlex defaults for legal copy", () => {
    expect(brand.name).toBe("ExamFlex");
    expect(brand.supportEmail).toBe("support@examflex.in");
    expect(brand.legalJurisdiction).toContain("Kerala");
  });
});
