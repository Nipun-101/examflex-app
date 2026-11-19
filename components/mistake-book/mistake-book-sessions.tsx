"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MistakeBookEmptyState } from "@/components/mistake-book/mistake-book-empty-state";
import { MistakeBookNudgeCard } from "@/components/mistake-book/mistake-book-nudge-card";
import { MistakeBookSessionCard } from "@/components/mistake-book/mistake-book-session-card";
import { MistakeFilters } from "@/components/mistake-book/mistake-filters";
import { MistakeBookSummaryCard } from "@/components/mistake-book/mistake-book-summary-card";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { listMistakeBookSessions } from "@/lib/api/mistake-book";
import { chaptersForSubjectFilter } from "@/lib/mistake-book/selectors";
import {
  groupSessionsByRecency,
  recencySectionLabel,
  type MistakeRecencySectionId,
} from "@/lib/mistake-book/session-list";
import {
  MISTAKE_BOOK_COPY,
  type MistakeBookListSummary,
  type MistakeBookSession,
  type MistakeSubjectFilterId,
} from "@/types/mistake-book";

type LoadState =
  | { status: "loading"; fetchKey: string }
  | { status: "error"; message: string; fetchKey: string }
  | {
      status: "ready";
      sessions: MistakeBookSession[];
      summary: MistakeBookListSummary;
      fetchKey: string;
    };

const RECENCY_ORDER: readonly MistakeRecencySectionId[] = [
  "today",
  "earlierThisWeek",
  "older",
];

export function MistakeBookSessions() {
  const [subjectId, setSubjectId] = useState<MistakeSubjectFilterId>("all");
  const [chapterId, setChapterId] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);
  const fetchKey = `${subjectId}:${chapterId}:${reloadKey}`;
  const [state, setState] = useState<LoadState>({
    status: "loading",
    fetchKey,
  });

  const load = useCallback(
    async (
      key: string,
      nextSubjectId: MistakeSubjectFilterId,
      nextChapterId: string
    ): Promise<LoadState> => {
      const result = await listMistakeBookSessions({
        page: 1,
        limit: 50,
        ...(nextSubjectId === "all" ? {} : { subjectId: nextSubjectId }),
        ...(nextChapterId === "all" ? {} : { topicId: nextChapterId }),
      });
      if (!result.ok) {
        return { status: "error", message: result.message, fetchKey: key };
      }
      return {
        status: "ready",
        sessions: [...result.data.data],
        summary: result.data.summary,
        fetchKey: key,
      };
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const key = fetchKey;
    void load(key, subjectId, chapterId).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load, fetchKey, subjectId, chapterId]);

  const loading = state.status === "loading" || state.fetchKey !== fetchKey;
  const summary = state.status === "ready" ? state.summary : null;
  const sessions = state.status === "ready" ? state.sessions : null;

  const groups = useMemo(
    () => groupSessionsByRecency(sessions ?? []),
    [sessions]
  );

  const subjectOptions = useMemo(
    () => [
      { id: "all" as const, label: "All subjects" },
      ...(summary?.subjects ?? []),
    ],
    [summary]
  );

  const chapterOptions = useMemo(
    () => chaptersForSubjectFilter(summary?.chapters ?? [], subjectId),
    [summary, subjectId]
  );

  function handleSubjectChange(next: MistakeSubjectFilterId) {
    setSubjectId(next);
    setChapterId("all");
  }

  if (loading && summary === null) {
    return <StudyRouteLoading busy />;
  }

  if (
    state.status === "ready" &&
    state.summary.totalMistakes === 0 &&
    subjectId === "all" &&
    chapterId === "all"
  ) {
    return <MistakeBookEmptyState />;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)] lg:items-start lg:gap-x-8 lg:gap-y-6">
      <header className="flex flex-col gap-2 lg:col-start-1 lg:row-start-1">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
          {MISTAKE_BOOK_COPY.title}
        </h1>
        <p className="text-sm text-study-muted-soft lg:text-base">
          {MISTAKE_BOOK_COPY.sessionsTip}
        </p>
      </header>

      <aside className="flex flex-col gap-4 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:sticky lg:top-6">
        {summary ? <MistakeBookSummaryCard summary={summary} /> : null}
        <div className="hidden lg:block">
          <MistakeBookNudgeCard />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-2 lg:gap-6">
        {summary && summary.subjects.length > 0 ? (
          <MistakeFilters
            subjects={subjectOptions}
            chapters={chapterOptions}
            subjectId={subjectId}
            chapterId={chapterId}
            onSubjectChange={handleSubjectChange}
            onChapterChange={setChapterId}
          />
        ) : null}

        <div className="flex flex-col gap-6">
          {state.status === "error" ? (
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
          ) : null}

          {state.status === "ready" && state.sessions.length === 0 ? (
            <p className="rounded-[20px] bg-white p-6 text-sm text-study-muted-soft shadow-soft">
              No sessions match this filter.
            </p>
          ) : null}

          {RECENCY_ORDER.map((sectionId) => {
            const rows = groups[sectionId];
            if (rows.length === 0) return null;
            return (
              <section key={sectionId} className="flex flex-col gap-3">
                <h2 className="text-[0.625rem] font-semibold tracking-[0.14em] text-study-green uppercase">
                  {recencySectionLabel(sectionId)}
                </h2>
                <ul className="flex flex-col gap-3">
                  {rows.map((session) => (
                    <li key={session.mockTestId}>
                      <MistakeBookSessionCard session={session} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
