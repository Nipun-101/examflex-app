import { describe, expect, it } from "vitest";
import {
  APP_NAV_ITEMS,
  PROFILE_HREF,
  isAppNavActive,
} from "@/lib/navigation/app-nav";

describe("app navigation", () => {
  it("lists study destinations with Analysis instead of Colleges", () => {
    expect(APP_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Today",
      "Mocks",
      "Equation Book",
      "Mistake Book",
      "Analysis",
    ]);
    expect(PROFILE_HREF).toBe("/profile");
  });

  it("marks exact and nested paths as active", () => {
    expect(isAppNavActive("/today", "/today")).toBe(true);
    expect(isAppNavActive("/mocks/full", "/mocks")).toBe(true);
    expect(isAppNavActive("/today", "/mocks")).toBe(false);
  });
});
