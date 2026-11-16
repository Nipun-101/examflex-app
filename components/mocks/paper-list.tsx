"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, RefreshCw } from "lucide-react";
import { PaperCard } from "@/components/mocks/paper-card";
import { ViewPlansDialog } from "@/components/mocks/view-plans-dialog";
import { StudyButton } from "@/components/study/study-button";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { useLaunchAttempt } from "@/hooks/use-launch-attempt";
import { launchErrorPlansTestId } from "@/lib/mocks/launch-error";
import type { FetchPaperPage, PaperPage } from "@/lib/mocks/paper-page";

type PaperListProps = {
  title: string;
  description: string;
  emptyMessage: string;
  fetchPage: FetchPaperPage;
};

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; page: PaperPage };

export function PaperList({
  title,
  description,
  emptyMessage,
  fetchPage,
}: PaperListProps) {
  const { startingTestId, startError, launch, clearError } =
    useLaunchAttempt();
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [pageNumber, setPageNumber] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [plansPaperId, setPlansPaperId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPage(pageNumber).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { status: "ready", page: result.data }
          : { status: "error", message: result.message }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPage, pageNumber, reloadKey]);

  function goToPage(next: number) {
    setState({ status: "loading" });
    setPageNumber(next);
  }

  function retry() {
    setState({ status: "loading" });
    setReloadKey((key) => key + 1);
  }

  const header = (
    <header>
      <h2 className="font-display text-xl font-semibold text-study-ink sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-study-muted-soft">{description}</p>
    </header>
  );

  if (state.status === "loading") {
    return (
      <>
        {header}
        <StudyLoadingOverlay
          open
          scope="viewport"
          label={`Loading ${title}...`}
        />
      </>
    );
  }

  if (state.status === "error") {
    return (
      <section className="space-y-4">
        {header}
        <div
          role="alert"
          className="rounded-[14px] border border-study-divider bg-white px-4 py-6 text-center"
        >
          <p className="text-sm text-study-ink">{state.message}</p>
          <StudyButton
            variant="solid"
            className="mt-4 inline-flex h-11 min-w-[11rem] items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold"
            onClick={retry}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </StudyButton>
        </div>
      </section>
    );
  }

  const { items, pagination } = state.page;
  const launching = startingTestId !== null;
  const errorPlansTestId = launchErrorPlansTestId(startError);

  return (
    <section className="space-y-4">
      {header}

      {startError ? (
        <div
          role="alert"
          className="rounded-[12px] border border-study-divider bg-white px-4 py-3 text-sm text-study-ink"
        >
          <p>{startError.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {errorPlansTestId ? (
              <StudyButton
                variant="solid"
                className="inline-flex h-11 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold"
                onClick={() => setPlansPaperId(errorPlansTestId)}
              >
                <Lock className="h-4 w-4" aria-hidden />
                View plans
              </StudyButton>
            ) : null}
            <StudyButton
              variant="surface"
              className="h-11 rounded-[10px] px-4 text-sm font-semibold"
              onClick={clearError}
            >
              Dismiss
            </StudyButton>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-[14px] border border-study-divider bg-white px-4 py-8 text-center text-sm text-study-muted-soft">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isActing={startingTestId === paper.id}
              disabled={launching && startingTestId !== paper.id}
              onViewPlans={() => setPlansPaperId(paper.id)}
              onLaunch={() => void launch(paper)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 ? (
        <nav
          aria-label={`${title} pages`}
          className="flex items-center justify-between gap-3 pt-2"
        >
          <StudyButton
            variant="surface"
            className="inline-flex h-11 min-w-[7rem] items-center justify-center gap-1 rounded-[10px] px-3 text-sm font-semibold"
            disabled={!pagination.hasPrevPage || launching}
            onClick={() => goToPage(Math.max(1, pageNumber - 1))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </StudyButton>
          <p className="text-sm text-study-muted-soft">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <StudyButton
            variant="surface"
            className="inline-flex h-11 min-w-[7rem] items-center justify-center gap-1 rounded-[10px] px-3 text-sm font-semibold"
            disabled={!pagination.hasNextPage || launching}
            onClick={() => goToPage(pageNumber + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </StudyButton>
        </nav>
      ) : null}

      <ViewPlansDialog
        open={plansPaperId !== null}
        onClose={() => setPlansPaperId(null)}
        {...(plansPaperId ? { mockTestId: plansPaperId } : {})}
      />
    </section>
  );
}
