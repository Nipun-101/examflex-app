"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { ExamHubNav } from "@/components/mocks/exam-hub-nav";
import { StudyButton } from "@/components/study/study-button";
import { ExamPageProvider, useExamPage } from "@/hooks/use-exam-page";

type ExamHubShellProps = {
  examId: string;
  children: React.ReactNode;
};

export function ExamHubShell({ examId, children }: ExamHubShellProps) {
  return (
    <ExamPageProvider examId={examId}>
      <ExamHubShellInner examId={examId}>{children}</ExamHubShellInner>
    </ExamPageProvider>
  );
}

function ExamHubShellInner({
  examId,
  children,
}: ExamHubShellProps) {
  const { exam, loading, error, reload } = useExamPage();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/mocks"
          aria-label="Back to Mocks"
          className="inline-flex h-11 items-center gap-2 text-sm font-medium text-study-muted-soft hover:text-study-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Back to Mocks</span>
        </Link>
        {exam ? (
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold text-study-ink sm:text-2xl">
            {exam.name}
          </h1>
        ) : null}
      </div>

      <ExamHubNav examId={examId} />

      {error && !loading ? (
        <div
          role="alert"
          className="rounded-[14px] border border-study-divider bg-white px-4 py-6 text-center"
        >
          <p className="text-sm text-study-ink">{error}</p>
          <StudyButton
            variant="solid"
            className="mt-4"
            onClick={reload}
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Try again
          </StudyButton>
        </div>
      ) : null}

      {/*
        Always keep tab pages in the tree so Instant Soft Nav can validate them.
        Hide while the exam shell loads / errors; lists pause fetching via context.
      */}
      <div
        className={loading || error ? "hidden" : undefined}
        aria-hidden={loading || Boolean(error)}
      >
        {children}
      </div>
    </div>
  );
}
