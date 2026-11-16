import { describe, expect, it } from "vitest";
import { paperCountLabel } from "@/lib/mocks/paper-count-label";

describe("paperCountLabel", () => {
  it("formats zero, one and many", () => {
    expect(paperCountLabel(0)).toBe("No papers yet");
    expect(paperCountLabel(1)).toBe("1 paper ready");
    expect(paperCountLabel(4)).toBe("4 papers ready");
  });
});
