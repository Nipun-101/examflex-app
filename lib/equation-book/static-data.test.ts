import { describe, expect, it } from "vitest";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";

describe("EQUATION_BOOK_DATA", () => {
  it("includes Figma copy for the featured incline card", () => {
    expect(EQUATION_BOOK_DATA.title).toBe("Equation Book");
    expect(EQUATION_BOOK_DATA.tagline).toBe("A few cards. A clearer head.");
    expect(EQUATION_BOOK_DATA.subjects.map((s) => s.label)).toEqual([
      "Physics",
      "Chemistry",
      "Biology",
    ]);

    const incline = EQUATION_BOOK_DATA.cards.find((card) =>
      card.promptTitle.includes("rough incline")
    );
    expect(incline?.equation).toContain("sin θ");
    expect(incline?.sourceLabel).toMatch(/Q34/);
  });
});
