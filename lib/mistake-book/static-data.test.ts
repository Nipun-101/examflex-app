import { describe, expect, it } from "vitest";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MISTAKE_BOOK_DATA", () => {
  it("includes the Figma seed mistake and filter options", () => {
    expect(MISTAKE_BOOK_DATA.title).toBe("Mistake Book");
    expect(MISTAKE_BOOK_DATA.mistakes[0]?.prompt).toMatch(/rough incline/i);
    expect(MISTAKE_BOOK_DATA.subjects.some((item) => item.id === "all")).toBe(
      true
    );
    expect(MISTAKE_BOOK_DATA.tripReasons).toHaveLength(3);
  });
});
