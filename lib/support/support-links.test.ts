import { describe, expect, it } from "vitest";
import { SUPPORT_NAV, SUPPORT_PATHS } from "@/lib/support/support-links";

describe("SUPPORT_PATHS", () => {
  it("exposes the three public support routes", () => {
    expect(SUPPORT_PATHS).toEqual({
      help: "/help",
      contact: "/contact",
      faqs: "/faqs",
    });
    expect(SUPPORT_NAV.map((item) => item.href)).toEqual([
      "/help",
      "/contact",
      "/faqs",
    ]);
  });
});
