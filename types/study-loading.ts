import type { StudyLoadingHoldKey } from "@/lib/study/loading-holds";

export type StudyLoadingScope = "viewport" | "parent";

export type StudyLoadingOptions = {
  label?: string;
};

export type StudyLoadingController = {
  isLoading: boolean;
  label: string;
  /** Imperative open (manual hold). Prefer hold/release for overlapping waits. */
  show: (options?: StudyLoadingOptions) => void;
  /** Release the manual hold only — other holds keep the overlay open. */
  hide: () => void;
  hold: (key: StudyLoadingHoldKey | string, options?: StudyLoadingOptions) => void;
  release: (key: StudyLoadingHoldKey | string) => void;
  run: <T>(
    action: () => Promise<T>,
    options?: StudyLoadingOptions
  ) => Promise<T>;
};
