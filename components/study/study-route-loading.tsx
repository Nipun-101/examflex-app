"use client";

import type { ReactNode } from "react";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { useOptionalStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { useStudyRouteLoading } from "@/hooks/use-study-route-loading";
import { STUDY_ROUTE_LOADING_LABEL } from "@/lib/study/loading";

type StudyRouteLoadingProps = {
  busy: boolean;
  /** Content once the wait is over. */
  children?: ReactNode;
  label?: string;
};

/**
 * Single-overlay gate for route boots.
 * Inside StudyLoadingProvider the shared portal is the only overlay — never
 * mount a second one beside Soft Nav / route holds.
 * Outside the provider (tests / rare), paints a local overlay for cold load.
 */
export function StudyRouteLoading({
  busy,
  children = null,
  label = STUDY_ROUTE_LOADING_LABEL,
}: StudyRouteLoadingProps) {
  const loading = useOptionalStudyLoadingOverlay();
  useStudyRouteLoading(busy, { label });

  if (!busy) {
    return children;
  }

  if (loading) {
    return null;
  }

  return <StudyLoadingOverlay open scope="viewport" label={label} />;
}

/** Suspense fallback that claims the shared overlay (no second portal). */
export function StudyRouteLoadingFallback({
  label = STUDY_ROUTE_LOADING_LABEL,
}: {
  label?: string;
}) {
  useStudyRouteLoading(true, { label });
  return null;
}
