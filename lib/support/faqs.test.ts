import { describe, expect, it } from "vitest";
import { SUPPORT_FAQS, getSupportFaqIds } from "@/lib/support/faqs";

describe("SUPPORT_FAQS", () => {
  it("exposes unique FAQ ids covering core topics", () => {
    const ids = getSupportFaqIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(
      expect.arrayContaining([
        "what-is-examflex",
        "how-to-sign-in",
        "payments",
        "refunds",
        "delete-account",
      ])
    );
    expect(SUPPORT_FAQS.length).toBeGreaterThanOrEqual(5);
  });
});
