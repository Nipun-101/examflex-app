"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import { resolveStudyLoadingLabel } from "@/lib/study/loading";
import type {
  StudyLoadingController,
  StudyLoadingOptions,
} from "@/types/study-loading";

const StudyLoadingContext = createContext<StudyLoadingController | null>(null);

type StudyLoadingProviderProps = {
  children: ReactNode;
  defaultLabel?: string;
};

/**
 * Releases the Soft Nav hold when Soft Nav finishes (pathname or search changes).
 * Kept in Suspense because `useSearchParams` can suspend during static render.
 */
function StudyLoadingRouteSync({
  onSoftNavComplete,
}: {
  onSoftNavComplete: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSoftNavComplete();
  }, [routeKey, onSoftNavComplete]);

  return null;
}

export function StudyLoadingProvider({
  children,
  defaultLabel,
}: StudyLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState(resolveStudyLoadingLabel(defaultLabel));
  const holdsRef = useRef(new Set<string>());

  const hold = useCallback(
    (key: string, options?: StudyLoadingOptions) => {
      holdsRef.current.add(key);
      setLabel(resolveStudyLoadingLabel(options?.label ?? defaultLabel));
      setIsLoading(true);
    },
    [defaultLabel]
  );

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

  const releaseSoftNav = useCallback(() => {
    release(STUDY_LOADING_HOLD.softNav);
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

  const value = useMemo<StudyLoadingController>(
    () => ({
      isLoading,
      label,
      show,
      hide,
      hold,
      release,
      run,
    }),
    [hide, hold, isLoading, label, release, run, show]
  );

  return (
    <StudyLoadingContext.Provider value={value}>
      <Suspense fallback={null}>
        <StudyLoadingRouteSync onSoftNavComplete={releaseSoftNav} />
      </Suspense>
      {children}
      <StudyLoadingOverlay open={isLoading} label={label} scope="viewport" />
    </StudyLoadingContext.Provider>
  );
}

export function useStudyLoadingOverlay(): StudyLoadingController {
  const context = useContext(StudyLoadingContext);

  if (!context) {
    throw new Error(
      "useStudyLoadingOverlay must be used within StudyLoadingProvider"
    );
  }

  return context;
}

/** Same controller when inside the provider; null outside (e.g. public pages). */
export function useOptionalStudyLoadingOverlay(): StudyLoadingController | null {
  return useContext(StudyLoadingContext);
}
