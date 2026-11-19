import { describe, expect, it } from "vitest";
import { shouldBeginStudyNavigation } from "@/lib/study/nav-loading";

const baseClick = {
  defaultPrevented: false,
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
};

describe("shouldBeginStudyNavigation", () => {
  it("allows plain left-clicks to a different route", () => {
    expect(
      shouldBeginStudyNavigation(baseClick, "/mocks", "/today")
    ).toBe(true);
  });

  it("skips same-route clicks", () => {
    expect(
      shouldBeginStudyNavigation(baseClick, "/today", "/today")
    ).toBe(false);
  });

  it("allows same path when the query string changes", () => {
    expect(
      shouldBeginStudyNavigation(baseClick, "/mocks?page=2", "/mocks", "")
    ).toBe(true);
    expect(
      shouldBeginStudyNavigation(baseClick, "/mocks?page=2", "/mocks", "page=2")
    ).toBe(false);
  });

  it("skips modified clicks and non-primary buttons", () => {
    expect(
      shouldBeginStudyNavigation(
        { ...baseClick, metaKey: true },
        "/mocks",
        "/today"
      )
    ).toBe(false);
    expect(
      shouldBeginStudyNavigation({ ...baseClick, button: 1 }, "/mocks", "/today")
    ).toBe(false);
  });

  it("skips external, hash, and mailto links", () => {
    expect(
      shouldBeginStudyNavigation(baseClick, "https://examflex.app", "/today")
    ).toBe(false);
    expect(shouldBeginStudyNavigation(baseClick, "#section", "/today")).toBe(
      false
    );
    expect(
      shouldBeginStudyNavigation(baseClick, "mailto:hi@examflex.app", "/today")
    ).toBe(false);
  });

  it("skips when defaultPrevented", () => {
    expect(
      shouldBeginStudyNavigation(
        { ...baseClick, defaultPrevented: true },
        "/mocks",
        "/today"
      )
    ).toBe(false);
  });
});
