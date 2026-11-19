"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useOptionalStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import { STUDY_NAV_LOADING_LABEL } from "@/lib/study/nav-loading";

type NavigateOptions = {
  label?: string;
};

/**
 * Router helpers that keep the shared study overlay open through Soft Nav.
 * Outside StudyLoadingProvider, delegates to the Next.js router unchanged.
 */
export function useStudyRouter() {
  const router = useRouter();
  const loading = useOptionalStudyLoadingOverlay();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      loading?.hold(STUDY_LOADING_HOLD.softNav, {
        label: options?.label ?? STUDY_NAV_LOADING_LABEL,
      });
      router.push(href);
    },
    [loading, router]
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      loading?.hold(STUDY_LOADING_HOLD.softNav, {
        label: options?.label ?? STUDY_NAV_LOADING_LABEL,
      });
      router.replace(href);
    },
    [loading, router]
  );

  return useMemo(
    () => ({
      push,
      replace,
      prefetch: router.prefetch?.bind(router),
      back: router.back?.bind(router),
      forward: router.forward?.bind(router),
      refresh: router.refresh?.bind(router),
    }),
    [push, replace, router]
  );
}
