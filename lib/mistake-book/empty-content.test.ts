import { describe, expect, it } from "vitest";
import { MISTAKE_BOOK_EMPTY_CONTENT } from "@/lib/mistake-book/empty-content";

describe("MISTAKE_BOOK_EMPTY_CONTENT", () => {
  it("includes hero tags and three fill-up steps", () => {
    expect(MISTAKE_BOOK_EMPTY_CONTENT.tags).toHaveLength(3);
    expect(MISTAKE_BOOK_EMPTY_CONTENT.steps).toHaveLength(3);
    expect(MISTAKE_BOOK_EMPTY_CONTENT.steps[0]?.number).toBe("01");
  });
});
