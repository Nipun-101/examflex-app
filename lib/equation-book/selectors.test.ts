import { describe, expect, it } from "vitest";
import {
  chaptersFromSubject,
  defaultSubjectAndChapter,
  findCardIndex,
  mockCtaLabel,
  progressPercent,
  subjectsFromCatalog,
} from "@/lib/equation-book/selectors";
import {
  TEST_EQUATIONS,
  TEST_SUBJECTS,
} from "@/lib/equation-book/test-fixtures";

describe("equation-book selectors", () => {
  it("maps subjects and chapters from catalog", () => {
    expect(subjectsFromCatalog(TEST_SUBJECTS)).toEqual([
      { id: "sub-physics", label: "Physics" },
      { id: "sub-chem", label: "Chemistry" },
    ]);
    expect(chaptersFromSubject(TEST_SUBJECTS, "sub-physics")).toEqual([
      { id: "top-lom", label: "Laws of motion" },
      { id: "top-wep", label: "Work, energy & power" },
    ]);
  });

  it("computes progress and mock label", () => {
    expect(progressPercent(0, 8)).toBe(13);
    expect(progressPercent(0, 0)).toBe(0);
    expect(mockCtaLabel("Laws of motion")).toBe(
      "Take Laws of motion mock  →"
    );
  });

  it("finds card index by equation id", () => {
    expect(findCardIndex(TEST_EQUATIONS, "eq-2")).toBe(1);
    expect(findCardIndex(TEST_EQUATIONS, "missing")).toBe(0);
  });

  it("defaults to the first subject and chapter when prefs are missing", () => {
    expect(defaultSubjectAndChapter(TEST_SUBJECTS)).toEqual({
      subjectId: "sub-physics",
      topicId: "top-lom",
    });
    expect(
      defaultSubjectAndChapter(TEST_SUBJECTS, "sub-chem", "top-eq")
    ).toEqual({
      subjectId: "sub-chem",
      topicId: "top-eq",
    });
    expect(
      defaultSubjectAndChapter(TEST_SUBJECTS, "missing", "also-missing")
    ).toEqual({
      subjectId: "sub-physics",
      topicId: "top-lom",
    });
  });
});
