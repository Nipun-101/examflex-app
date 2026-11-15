import { describe, expect, it } from "vitest";
import {
  STUDY_LOADING_DEFAULT_LABEL,
  resolveStudyLoadingLabel,
} from "@/lib/study/loading";

describe("resolveStudyLoadingLabel", () => {
  it("returns the default label when input is empty", () => {
    expect(resolveStudyLoadingLabel()).toBe(STUDY_LOADING_DEFAULT_LABEL);
    expect(resolveStudyLoadingLabel("")).toBe(STUDY_LOADING_DEFAULT_LABEL);
    expect(resolveStudyLoadingLabel("   ")).toBe(STUDY_LOADING_DEFAULT_LABEL);
  });

  it("returns a trimmed custom label", () => {
    expect(resolveStudyLoadingLabel("  Saving mock  ")).toBe("Saving mock");
  });
});
