import { StudyLoadingProvider } from "@/components/study/study-loading-provider";

type AttemptShellProps = {
  children: React.ReactNode;
};

/** Full-screen attempt chrome: loading overlay provider, no StudyNav. */
export function AttemptShell({ children }: AttemptShellProps) {
  return (
    <StudyLoadingProvider>
      <div className="flex min-h-full flex-1 flex-col bg-study-canvas text-study-ink">
        {children}
      </div>
    </StudyLoadingProvider>
  );
}
