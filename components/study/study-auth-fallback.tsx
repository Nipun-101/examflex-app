/**
 * Deterministic Suspense fallback while the study layout reads the auth cookie.
 * Keeps a study-canvas shell without implying a signed-in session.
 */
export function StudyAuthFallback() {
  return (
    <div
      className="flex min-h-full flex-1 flex-col bg-study-canvas text-study-ink"
      role="status"
      aria-label="Loading study area"
    >
      <div className="border-b border-study-divider px-4 py-5 sm:px-6 lg:px-12">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-study-divider/60" />
      </div>
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-8 sm:px-6 lg:px-12">
        <div className="h-40 animate-pulse rounded-2xl bg-study-divider/40" />
        <span className="sr-only">Checking your session…</span>
      </div>
    </div>
  );
}
