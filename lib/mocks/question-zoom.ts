import type { CSSProperties } from "react";

/** Question text and options only. Zoom controls stay at normal size. */
export const QUESTION_ZOOM_STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6] as const;

export const DEFAULT_QUESTION_ZOOM_INDEX = QUESTION_ZOOM_STEPS.indexOf(1);

/** CSS custom property read by `.question-zoom` in globals.css. */
export const QUESTION_ZOOM_VAR = "--question-zoom";

export function clampZoomIndex(index: number): number {
  if (index < 0) return 0;
  if (index >= QUESTION_ZOOM_STEPS.length) {
    return QUESTION_ZOOM_STEPS.length - 1;
  }
  return index;
}

export function zoomScaleAt(index: number): number {
  return QUESTION_ZOOM_STEPS[clampZoomIndex(index)] ?? 1;
}

/**
 * Font-size based zoom (not CSS `zoom` / `transform: scale`).
 * CSS `zoom` rasterizes MathJax SVG and makes formulas look pixelated.
 */
export function questionZoomStyle(index: number): CSSProperties {
  return {
    [QUESTION_ZOOM_VAR]: String(zoomScaleAt(index)),
  } as CSSProperties;
}
