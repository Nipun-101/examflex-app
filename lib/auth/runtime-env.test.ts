import { afterEach, describe, expect, it, vi } from "vitest";
import { getWindow } from "@/lib/auth/runtime-env";

describe("runtime-env", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the browser window in jsdom", () => {
    expect(getWindow()).toBe(window);
  });

  it("returns undefined when window is unavailable", () => {
    vi.stubGlobal("window", undefined);
    expect(getWindow()).toBeUndefined();
  });
});
