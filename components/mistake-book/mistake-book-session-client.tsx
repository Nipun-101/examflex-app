"use client";

import { StudyNavLink } from "@/components/study/study-nav-link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MistakeBookView } from "@/components/mistake-book/mistake-book-view";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import {
  deleteMistakeBookEntry,
  getMistakeBookSession,
  patchMistakeTripReason,
} from "@/lib/api/mistake-book";
import {
  MISTAKE_BOOK_COPY,
  MISTAKE_TRIP_OPTIONS,
  type MistakeBookPageData,
  type MistakeBookSessionDetail,
  type MistakeTripReason,
} from "@/types/mistake-book";

type MistakeBookSessionClientProps = {
  mockTestId: string;
};

function toPageData(detail: MistakeBookSessionDetail): MistakeBookPageData {
  return {
    title: MISTAKE_BOOK_COPY.title,
    examBadge: MISTAKE_BOOK_COPY.examBadge,
    mockLabel: detail.title,
    subjects: [{ id: "all", label: "All subjects" }, ...detail.subjects],
    chapters: detail.chapters,
    tripReasons: MISTAKE_TRIP_OPTIONS,
    mistakes: detail.entries,
    understoodLabel: MISTAKE_BOOK_COPY.understoodLabel,
    understoodHint: MISTAKE_BOOK_COPY.understoodHint,
    timerLabel: MISTAKE_BOOK_COPY.timerLabel,
    timerHint: MISTAKE_BOOK_COPY.timerHint,
    tripPrompt: MISTAKE_BOOK_COPY.tripPrompt,
  };
}

type LoadState =
  | { status: "loading"; fetchKey: string }
  | { status: "error"; message: string; gone?: boolean; fetchKey: string }
  | { status: "ready"; detail: MistakeBookSessionDetail; fetchKey: string };

export function MistakeBookSessionClient({
  mockTestId,
}: MistakeBookSessionClientProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const fetchKey = `${mockTestId}:${reloadKey}`;
  const [state, setState] = useState<LoadState>({
    status: "loading",
    fetchKey,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(
    async (key: string): Promise<LoadState> => {
      const result = await getMistakeBookSession(mockTestId);
      if (!result.ok) {
        return {
          status: "error",
          message: result.message,
          gone: result.status === 404,
          fetchKey: key,
        };
      }
      return { status: "ready", detail: result.data, fetchKey: key };
    },
    [mockTestId]
  );

  useEffect(() => {
    let cancelled = false;
    const key = fetchKey;
    void load(key).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load, fetchKey]);

  const loading = state.status === "loading" || state.fetchKey !== fetchKey;
  const detail = state.status === "ready" ? state.detail : null;
  const gone =
    (state.status === "error" && Boolean(state.gone)) ||
    (detail !== null && detail.entries.length === 0);

  const pageData = useMemo(
    () => (detail ? toPageData(detail) : null),
    [detail]
  );

  async function handleUnderstood(entryId: string) {
    const result = await deleteMistakeBookEntry(entryId);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setActionError(null);
    setState((prev) => {
      if (prev.status !== "ready") return prev;
      const entries = prev.detail.entries.filter(
        (entry) => entry.id !== entryId
      );
      return {
        ...prev,
        detail: {
          ...prev.detail,
          entries,
          remainingCount: entries.length,
        },
      };
    });
  }

  async function handleTripReasonChange(
    entryId: string,
    tripReason: MistakeTripReason
  ) {
    void patchMistakeTripReason(entryId, tripReason);
    setState((prev) => {
      if (prev.status !== "ready") return prev;
      return {
        ...prev,
        detail: {
          ...prev.detail,
          entries: prev.detail.entries.map((entry) =>
            entry.id === entryId ? { ...entry, tripReason } : entry
          ),
        },
      };
    });
  }

  if (loading && !gone) {
    return <StudyRouteLoading busy />;
  }

  if (gone) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-[20px] bg-white p-6 text-sm text-study-muted-soft shadow-soft">
          Nothing left in this paper’s Mistake Book. Head back to pick another
          session.
        </p>
        <StudyNavLink
          href="/mistake-book"
          className="text-sm font-medium text-study-green"
        >
          ← All Mistake Book sessions
        </StudyNavLink>
      </div>
    );
  }

  if (state.status === "error" && !pageData) {
    return (
      <div className="rounded-[20px] bg-white p-6 shadow-soft">
        <p className="text-sm text-study-muted-soft">{state.message}</p>
        <button
          type="button"
          className="mt-4 text-sm font-medium text-study-green"
          onClick={() => {
            setState({ status: "loading", fetchKey });
            setReloadKey((value) => value + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!pageData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <StudyNavLink
        href="/mistake-book"
        className="text-sm font-medium text-study-green w-fit"
      >
        ← All sessions
      </StudyNavLink>
      {actionError ? (
        <p className="text-sm text-study-muted-soft" role="status">
          {actionError}
        </p>
      ) : null}
      <MistakeBookView
        data={pageData}
        onUnderstood={handleUnderstood}
        onTripReasonChange={handleTripReasonChange}
      />
    </div>
  );
}
