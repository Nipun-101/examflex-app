export type StudyLoadingScope = "viewport" | "parent";

export type StudyLoadingOptions = {
  label?: string;
};

export type StudyLoadingController = {
  isLoading: boolean;
  label: string;
  show: (options?: StudyLoadingOptions) => void;
  hide: () => void;
  run: <T>(
    action: () => Promise<T>,
    options?: StudyLoadingOptions
  ) => Promise<T>;
};
