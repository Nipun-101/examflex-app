"use client";

import { useCallback, useRef, useState } from "react";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import { resolveStudyLoadingLabel } from "@/lib/study/loading";
import type {
  StudyLoadingController,
  StudyLoadingOptions,
} from "@/types/study-loading";

/**
 * Standalone loading controller (no shared portal).
 * Matches StudyLoadingController including hold/release for local overlays.
 */
export function useStudyLoading(
  initialLabel?: string
): StudyLoadingController {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState(resolveStudyLoadingLabel(initialLabel));
  const holdsRef = useRef(new Set<string>());

  const hold = useCallback((key: string, options?: StudyLoadingOptions) => {
    holdsRef.current.add(key);
    setLabel(resolveStudyLoadingLabel(options?.label ?? initialLabel));
    setIsLoading(true);
  }, [initialLabel]);

  const release = useCallback((key: string) => {
    holdsRef.current.delete(key);
    if (holdsRef.current.size === 0) {
      setIsLoading(false);
    }
  }, []);

  const show = useCallback(
    (options?: StudyLoadingOptions) => {
      hold(STUDY_LOADING_HOLD.manual, options);
    },
    [hold]
  );

  const hide = useCallback(() => {
    release(STUDY_LOADING_HOLD.manual);
  }, [release]);

  const run = useCallback(
    async <T,>(
      action: () => Promise<T>,
      options?: StudyLoadingOptions
    ): Promise<T> => {
      hold(STUDY_LOADING_HOLD.manual, options);
      try {
        return await action();
      } finally {
        release(STUDY_LOADING_HOLD.manual);
      }
    },
    [hold, release]
  );

  return {
    isLoading,
    label,
    show,
    hide,
    hold,
    release,
    run,
  };
}
