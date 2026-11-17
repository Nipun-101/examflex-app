import { describe, expect, it } from "vitest";
import {
  chaptersForSubjectFilter,
  filterMistakes,
  paperTypeLabel,
  progressPercent,
  remainingSubtitle,
} from "@/lib/mistake-book/selectors";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("mistake-book selectors", () => {
  it("hides chapters until a subject is chosen", () => {
    expect(
      chaptersForSubjectFilter(MISTAKE_BOOK_DATA.chapters, "all")
    ).toEqual([]);
  });

  it("filters chapters and mistakes by subject and chapter", () => {
    expect(
      chaptersForSubjectFilter(MISTAKE_BOOK_DATA.chapters, "biology")
    ).toEqual([
      expect.objectContaining({ id: "cell-cycle", subjectId: "biology" }),
    ]);

    const physics = filterMistakes(
      MISTAKE_BOOK_DATA.mistakes,
      "physics",
      "all"
    );
    expect(physics.every((item) => item.subjectId === "physics")).toBe(true);

    const chapter = filterMistakes(
      MISTAKE_BOOK_DATA.mistakes,
      "physics",
      "work-energy-power"
    );
    expect(chapter).toHaveLength(1);
    expect(chapter[0]?.id).toBe("mb-3");
  });

  it("computes progress and remaining copy", () => {
    expect(progressPercent(0, 0)).toBe(0);
    expect(progressPercent(0, 5)).toBe(20);
    expect(progressPercent(4, 5)).toBe(100);
    expect(remainingSubtitle("Mock 12", 1)).toBe(
      "Mock 12  ·  1 mistake remaining"
    );
    expect(remainingSubtitle("Mock 12", 19)).toBe(
      "Mock 12  ·  19 mistakes remaining"
    );
    expect(paperTypeLabel("FULL_EXAM")).toBe("Full mock");
    expect(paperTypeLabel("TOPIC_WISE")).toBe("Chapter wise");
    expect(paperTypeLabel("SPRINT")).toBe("Sprint");
  });
});
