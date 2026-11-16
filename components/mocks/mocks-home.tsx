"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { CategorySection } from "@/components/mocks/category-section";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { useStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { getExamsByCategory } from "@/lib/api/exams";
import type { ApiExamCategory } from "@/types/exam";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      categories: ApiExamCategory[];
      /** True when the API returned categories but none had student-visible exams. */
      hiddenExamsOnly: boolean;
    };

function toReadyState(categories: ApiExamCategory[]): Extract<
  LoadState,
  { status: "ready" }
> {
  const withExams = categories.filter((category) => category.exams.length > 0);
  return {
    status: "ready",
    categories: withExams,
    hiddenExamsOnly: withExams.length === 0 && categories.length > 0,
  };
}

export function MocksHome() {
  const studyLoading = useStudyLoadingOverlay();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void getExamsByCategory().then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: "error", message: result.message });
        return;
      }
      setState(toReadyState(result.data));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRetry() {
    setState({ status: "loading" });
    const result = await studyLoading.run(() => getExamsByCategory(), {
      label: "Loading mock exams...",
    });
    if (!result.ok) {
      setState({ status: "error", message: result.message });
      return;
    }
    setState(toReadyState(result.data));
  }

  if (state.status === "loading") {
    return (
      <>
        <MocksHomeHeader />
        <StudyLoadingOverlay
          open
          scope="viewport"
          label="Loading mock exams..."
        />
      </>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-6">
        <MocksHomeHeader />
        <div
          role="alert"
          className="rounded-[14px] border border-study-divider bg-white px-4 py-6 text-center"
        >
          <p className="text-sm text-study-ink">{state.message}</p>
          <button
            type="button"
            onClick={() => void handleRetry()}
            className="mt-4 inline-flex h-11 min-w-[11rem] items-center justify-center gap-2 rounded-[10px] bg-study-green px-4 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (state.categories.length === 0) {
    return (
      <div className="space-y-6">
        <MocksHomeHeader />
        <p className="rounded-[14px] border border-study-divider bg-white px-4 py-8 text-center text-sm text-study-muted-soft">
          {state.hiddenExamsOnly
            ? "Exams exist for these categories, but none are marked “Show in student app” yet. Turn that on in admin to list them here."
            : "Mock exams will show up here once they are published."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MocksHomeHeader />
      {state.categories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  );
}

function MocksHomeHeader() {
  return (
    <header>
      <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
        Practice
      </p>
      <h1 className="mt-1 font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem]">
        Mocks
      </h1>
      <p className="mt-2 max-w-xl text-sm text-study-muted-soft">
        Pick an exam to open chapter-wise papers, full mocks, and sprint tests.
      </p>
    </header>
  );
}
