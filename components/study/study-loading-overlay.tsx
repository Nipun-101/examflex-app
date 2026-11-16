"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StudyLoader } from "@/components/study/study-loader";
import {
  STUDY_LOADING_HELPER,
  resolveStudyLoadingLabel,
} from "@/lib/study/loading";
import type { StudyLoadingScope } from "@/types/study-loading";

type StudyLoadingOverlayProps = {
  open: boolean;
  label?: string;
  scope?: StudyLoadingScope;
  className?: string;
};

export function StudyLoadingOverlay({
  open,
  label,
  scope = "viewport",
  className = "",
}: StudyLoadingOverlayProps) {
  const resolvedLabel = resolveStudyLoadingLabel(label);
  // Keep SSR and the first client render identical (in-tree overlay). Portal
  // only after mount so we do not trip a hydration mismatch.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || scope !== "viewport") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, scope]);

  if (!open) {
    return null;
  }

  const positionClass =
    scope === "viewport"
      ? "fixed inset-0 z-[80] h-[100dvh] min-h-[100dvh] w-screen"
      : "absolute inset-0 z-20 h-full min-h-full w-full";

  const overlay = (
    <div
      className={`${positionClass} grid place-items-center bg-study-canvas/80 p-4 backdrop-blur-[2px] ${className}`.trim()}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="study-loading-label"
      data-study-loading-overlay=""
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div
        className="flex w-full max-w-xs flex-col items-center gap-4 rounded-[20px] border border-study-divider bg-white px-6 py-7 shadow-soft"
        tabIndex={-1}
      >
        <StudyLoader size="lg" />
        <p
          id="study-loading-label"
          className="text-center font-display text-base font-semibold text-study-ink"
        >
          {resolvedLabel}
        </p>
        <p className="text-center text-sm text-study-muted-soft">
          {STUDY_LOADING_HELPER}
        </p>
      </div>
    </div>
  );

  // Before hydration/portal mount, still paint the overlay in-tree so blocking
  // waits are visible on the first frame (and in SSR HTML). Portal after mount.
  if (scope === "viewport" && mounted) {
    return createPortal(overlay, document.body);
  }

  return overlay;
}
