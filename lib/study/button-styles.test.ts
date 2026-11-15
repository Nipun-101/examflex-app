import { describe, expect, it } from "vitest";
import {
  STUDY_CONTROL_VARIANTS,
  studyControlClass,
} from "@/lib/study/button-styles";

describe("studyControlClass", () => {
  it("applies pointer and mint hover on surface controls", () => {
    const className = studyControlClass("surface");

    expect(className).toContain("cursor-pointer");
    expect(className).toContain("hover:bg-study-mint");
    expect(className).toContain("border-study-divider");
  });

  it("keeps soft subject chips borderless with the same mint hover", () => {
    const className = studyControlClass("soft");

    expect(className).toContain("cursor-pointer");
    expect(className).toContain("hover:bg-study-mint");
    expect(className).not.toContain("border-study-divider");
  });

  it("keeps outline CTAs green with the shared surface hover", () => {
    const className = studyControlClass("outline");

    expect(className).toContain("text-study-green");
    expect(className).toContain("hover:bg-study-mint");
    expect(className).toContain("cursor-pointer");
  });

  it("merges an optional className for every variant", () => {
    for (const variant of STUDY_CONTROL_VARIANTS) {
      expect(studyControlClass(variant, "h-11")).toContain("h-11");
      expect(studyControlClass(variant, "h-11")).toContain("cursor-pointer");
    }
  });
});
