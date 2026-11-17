import { describe, expect, it } from "vitest";
import { mistakeRailLabel } from "@/lib/mistake-book/rail-label";
import { MISTAKE_BOOK_COPY } from "@/types/mistake-book";

describe("mistakeRailLabel", () => {
  it("joins question, subject, and mock title", () => {
    expect(
      mistakeRailLabel(
        { questionNumber: "Q6", subjectLabel: "PHYSICS CORE" },
        "KINEMATICS - 1"
      )
    ).toBe("Q6 · PHYSICS CORE · KINEMATICS - 1");
  });

  it("uses a generic mock label when the title is missing", () => {
    expect(
      mistakeRailLabel(
        { questionNumber: "Q2", subjectLabel: "PHYSICS" },
        "   "
      )
    ).toBe(`Q2 · PHYSICS · ${MISTAKE_BOOK_COPY.railGenericMockLabel}`);
  });
});
