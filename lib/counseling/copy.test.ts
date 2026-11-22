import { describe, expect, it } from "vitest";
import { buildCounselingCardCopy, counselingModalSubtitle } from "./copy";

describe("counseling copy", () => {
  it("adapts card copy to the selected exam", () => {
    const copy = buildCounselingCardCopy("JEE Main");
    expect(copy.badge).toContain("JEE MAIN");
    expect(copy.body).toContain("JEE Main expert");
    expect(copy.expertRole).toContain("JEE Main mentor");
    expect(copy.expertName).toBe("Anandu Narayanan");
  });

  it("builds the modal subtitle", () => {
    expect(counselingModalSubtitle("NEET UG")).toBe(
      "with Anandu Narayanan · NEET UG mentor"
    );
  });
});
