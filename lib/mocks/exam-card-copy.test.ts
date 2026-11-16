import { describe, expect, it } from "vitest";
import {
  EXAM_CARD_DESCRIPTION_MAX,
  clipExamDescription,
} from "@/lib/mocks/exam-card-copy";

describe("clipExamDescription", () => {
  it("returns trimmed text when under the limit", () => {
    expect(clipExamDescription("  Short copy.  ")).toBe("Short copy.");
  });

  it("collapses internal whitespace", () => {
    expect(clipExamDescription("One   two\nthree")).toBe("One two three");
  });

  it("clips at the max and appends an ellipsis", () => {
    const long = "a".repeat(EXAM_CARD_DESCRIPTION_MAX + 20);
    const clipped = clipExamDescription(long);
    expect(clipped.endsWith("...")).toBe(true);
    expect(clipped.length).toBe(EXAM_CARD_DESCRIPTION_MAX + 3);
  });
});
