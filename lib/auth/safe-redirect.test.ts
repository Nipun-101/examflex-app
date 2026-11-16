import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildLoginUrl,
  getSafeRedirectPath,
  isSafeRedirectPath,
} from "@/lib/auth/safe-redirect";

describe("safe-redirect", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts safe study paths and rejects open redirects", () => {
    expect(isSafeRedirectPath("/today")).toBe(true);
    expect(isSafeRedirectPath("/mocks?tab=1")).toBe(true);
    expect(isSafeRedirectPath("/")).toBe(false);
    expect(isSafeRedirectPath("/login")).toBe(false);
    expect(isSafeRedirectPath("/login/extra")).toBe(false);
    expect(isSafeRedirectPath("//evil.com")).toBe(false);
    expect(isSafeRedirectPath("/today/../etc")).toBe(false);
  });

  it("resolves candidates with decode and fallback", () => {
    expect(getSafeRedirectPath("/today")).toBe("/today");
    expect(getSafeRedirectPath("%2Fprofile")).toBe("/profile");
    expect(getSafeRedirectPath("%E0%A4%A")).toBe("/today");
    expect(getSafeRedirectPath("/login")).toBe("/today");
    expect(getSafeRedirectPath(null, "/mocks")).toBe("/mocks");
    // Decoded value unsafe, raw candidate still safe
    expect(getSafeRedirectPath("/today%")).toBe("/today%");
  });

  it("builds login URLs with optional redirect", () => {
    expect(buildLoginUrl("/today")).toBe("/login?redirect=%2Ftoday");
    expect(buildLoginUrl("/")).toBe("/login");
    expect(buildLoginUrl()).toBe("/login");
    expect(buildLoginUrl("")).toBe("/login");
  });

  it("uses the current window path when building login URLs", () => {
    window.history.pushState({}, "", "/analysis?x=1");
    expect(buildLoginUrl()).toBe("/login?redirect=%2Fanalysis%3Fx%3D1");
    expect(
      buildLoginUrl(undefined, { pathname: "/mocks", search: "" })
    ).toBe("/login?redirect=%2Fmocks");
  });

  it("rejects the root path even with a query string", () => {
    expect(isSafeRedirectPath("/?")).toBe(false);
  });

  it("builds a bare login URL when window is unavailable", () => {
    vi.stubGlobal("window", undefined);
    expect(buildLoginUrl()).toBe("/login");
  });
});
