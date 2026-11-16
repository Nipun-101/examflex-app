import { describe, expect, it } from "vitest";
import { supportMailto } from "@/lib/support/support-mailto";

describe("supportMailto", () => {
  it("builds plain and parameterized mailto links", () => {
    expect(supportMailto()).toBe("mailto:support@examflex.in");
    expect(supportMailto("Help", "Hello")).toBe(
      "mailto:support@examflex.in?subject=Help&body=Hello"
    );
  });
});
