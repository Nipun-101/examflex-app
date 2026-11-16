import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isAttemptLanguage,
  readAttemptLanguage,
  rememberAttemptLanguage,
} from "@/lib/mocks/attempt-language";

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("attempt language", () => {
  it("validates language codes", () => {
    expect(isAttemptLanguage("en")).toBe(true);
    expect(isAttemptLanguage("ml")).toBe(true);
    expect(isAttemptLanguage("hi")).toBe(false);
    expect(isAttemptLanguage(null)).toBe(false);
  });

  it("round-trips through sessionStorage", () => {
    rememberAttemptLanguage("a1", "ml");
    expect(readAttemptLanguage("a1")).toBe("ml");
  });

  it("defaults to English", () => {
    expect(readAttemptLanguage("none")).toBe("en");
    sessionStorage.setItem("examflex:attemptLanguage:bad", "xx");
    expect(readAttemptLanguage("bad")).toBe("en");
  });

  it("survives unavailable storage", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => rememberAttemptLanguage("a1", "ml")).not.toThrow();
    expect(readAttemptLanguage("a1")).toBe("en");
  });
});
