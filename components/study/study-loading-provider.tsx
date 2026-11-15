"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
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

export function StudyLoadingProvider({
  children,
  defaultLabel,
}: StudyLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState(resolveStudyLoadingLabel(defaultLabel));

  function show(options?: StudyLoadingOptions) {
    setLabel(resolveStudyLoadingLabel(options?.label ?? defaultLabel));
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

  const value: StudyLoadingController = {
    isLoading,
    label,
    show,
    hide,
    run,
  };

  return (
    <StudyLoadingContext.Provider value={value}>
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
