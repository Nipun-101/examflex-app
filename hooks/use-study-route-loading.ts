"use client";

import { useLayoutEffect } from "react";
import { useOptionalStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import { STUDY_ROUTE_LOADING_LABEL } from "@/lib/study/loading";
import type { StudyLoadingOptions } from "@/types/study-loading";

type UseStudyRouteLoadingOptions = StudyLoadingOptions & {
  /** Defaults to the shared route hold so Soft Nav can hand off cleanly. */
  holdKey?: string;
};

/**
 * Drives the single study overlay for route / boot waits.
 * Soft Nav already holds `soft-nav`; this hold keeps the same portal open
 * after Soft Nav releases, so copy and overlay never double up.
 * No-ops outside StudyLoadingProvider (local fallback overlay can paint).
 */
export function useStudyRouteLoading(
  busy: boolean,
  options?: UseStudyRouteLoadingOptions
): void {
  const loading = useOptionalStudyLoadingOverlay();
  const holdKey = options?.holdKey ?? STUDY_LOADING_HOLD.route;
  const label = options?.label ?? STUDY_ROUTE_LOADING_LABEL;

  useLayoutEffect(() => {
    if (!loading) return;
    if (!busy) {
      loading.release(holdKey);
      return;
    }
    loading.hold(holdKey, { label });
    return () => {
      loading.release(holdKey);
    };
  }, [busy, holdKey, label, loading]);
}
