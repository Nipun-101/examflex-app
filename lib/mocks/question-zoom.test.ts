import { describe, expect, it } from "vitest";
import {
  clampZoomIndex,
  DEFAULT_QUESTION_ZOOM_INDEX,
  QUESTION_ZOOM_STEPS,
  QUESTION_ZOOM_VAR,
  questionZoomStyle,
  zoomScaleAt,
} from "@/lib/mocks/question-zoom";

describe("question zoom", () => {
  it("defaults to 1x", () => {
    expect(QUESTION_ZOOM_STEPS[DEFAULT_QUESTION_ZOOM_INDEX]).toBe(1);
  });

  it("clamps out-of-range indexes", () => {
    expect(clampZoomIndex(-2)).toBe(0);
    expect(clampZoomIndex(99)).toBe(QUESTION_ZOOM_STEPS.length - 1);
    expect(zoomScaleAt(0)).toBe(0.8);
    expect(zoomScaleAt(99)).toBe(1.6);
  });

  it("exposes a CSS variable for font-size zoom (not CSS zoom)", () => {
    const style = questionZoomStyle(QUESTION_ZOOM_STEPS.length - 1);
    expect(style[QUESTION_ZOOM_VAR as keyof typeof style]).toBe("1.6");
    expect(style).not.toHaveProperty("zoom");
  });
});
