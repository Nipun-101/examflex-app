"use client";

import { ZoomIn, ZoomOut } from "lucide-react";
import { StudyButton } from "@/components/study/study-button";
import { QUESTION_ZOOM_STEPS } from "@/lib/mocks/question-zoom";

type ZoomControlsProps = {
  zoomIndex: number;
  onZoomIndexChange: (index: number) => void;
};

/** Zoom buttons stay at normal size; only question + options scale. */
export function ZoomControls({
  zoomIndex,
  onZoomIndexChange,
}: ZoomControlsProps) {
  const atMin = zoomIndex <= 0;
  const atMax = zoomIndex >= QUESTION_ZOOM_STEPS.length - 1;
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Question zoom">
      <StudyButton
        variant="surface"
        onClick={() => onZoomIndexChange(zoomIndex - 1)}
        disabled={atMin}
        aria-label="Zoom out question"
        className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-[10px] px-2.5 text-sm font-semibold sm:h-10 sm:min-w-10"
      >
        <ZoomOut className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Zoom (-)</span>
      </StudyButton>
      <StudyButton
        variant="surface"
        onClick={() => onZoomIndexChange(zoomIndex + 1)}
        disabled={atMax}
        aria-label="Zoom in question"
        className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-[10px] px-2.5 text-sm font-semibold sm:h-10 sm:min-w-10"
      >
        <ZoomIn className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Zoom (+)</span>
      </StudyButton>
    </div>
  );
}
