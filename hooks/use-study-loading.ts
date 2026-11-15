"use client";

import { useState } from "react";
import { resolveStudyLoadingLabel } from "@/lib/study/loading";
import type {
  StudyLoadingController,
  StudyLoadingOptions,
} from "@/types/study-loading";

export function useStudyLoading(
  initialLabel?: string
): StudyLoadingController {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState(resolveStudyLoadingLabel(initialLabel));

  function show(options?: StudyLoadingOptions) {
    setLabel(resolveStudyLoadingLabel(options?.label));
    setIsLoading(true);
  }

  function hide() {
    setIsLoading(false);
  }

  async function run<T>(
    action: () => Promise<T>,
    options?: StudyLoadingOptions
  ): Promise<T> {
    show(options);
    try {
      return await action();
    } finally {
      hide();
    }
  }

  return {
    isLoading,
    label,
    show,
    hide,
    run,
  };
}
