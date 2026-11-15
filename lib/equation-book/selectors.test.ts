import { describe, expect, it } from "vitest";
import {
  cardsForChapter,
  chaptersForSubject,
  mockCtaLabel,
  progressPercent,
} from "@/lib/equation-book/selectors";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";

describe("equation-book selectors", () => {
  it("filters chapters and cards by subject/chapter", () => {
    const physicsChapters = chaptersForSubject(
      EQUATION_BOOK_DATA.chapters,
      "physics"
    );
    expect(physicsChapters.every((c) => c.subjectId === "physics")).toBe(true);

    const cards = cardsForChapter(
      EQUATION_BOOK_DATA.cards,
      "laws-of-motion"
    );
    expect(cards).toHaveLength(8);
    expect(cards[2]?.promptTitle).toMatch(/rough incline/i);
  });

  it("computes progress percent with safe bounds", () => {
    expect(progressPercent(2, 8)).toBe(38);
    expect(progressPercent(0, 0)).toBe(0);
    expect(progressPercent(99, 8)).toBe(100);
    expect(progressPercent(-1, 8)).toBe(0);
  });

  it("builds the mock CTA label", () => {
    expect(mockCtaLabel("Laws of motion")).toBe(
      "Take Laws of motion mock  →"
    );
  });
});
