"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MistakeBookEmptyState } from "@/components/mistake-book/mistake-book-empty-state";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { listMistakeBookSessions } from "@/lib/api/mistake-book";
import { paperTypeLabel } from "@/lib/mistake-book/selectors";
import {
  MISTAKE_BOOK_COPY,
  type MistakeBookSession,
} from "@/types/mistake-book";

function formatSubmittedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type LoadState =
  | { status: "loading"; fetchKey: number }
  | { status: "error"; message: string; fetchKey: number }
  | { status: "ready"; sessions: MistakeBookSession[]; fetchKey: number };

export function MistakeBookSessions() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<LoadState>({
    status: "loading",
    fetchKey: 0,
  });

  const load = useCallback(async (key: number): Promise<LoadState> => {
    const result = await listMistakeBookSessions({ page: 1, limit: 50 });
    if (!result.ok) {
      return { status: "error", message: result.message, fetchKey: key };
    }
    return {
      status: "ready",
      sessions: result.data.data,
      fetchKey: key,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const key = reloadKey;
    void load(key).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load, reloadKey]);

  const loading = state.status === "loading" || state.fetchKey !== reloadKey;

  if (loading) {
    return (
      <StudyLoadingOverlay
        open
        scope="viewport"
        label="Loading your Mistake Book..."
      />
    );
  }

  if (state.status === "ready" && state.sessions.length === 0) {
    return <MistakeBookEmptyState />;
  }

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
          {MISTAKE_BOOK_COPY.title}
        </h1>
        <p className="text-sm text-study-muted-soft lg:text-base">
          {MISTAKE_BOOK_COPY.sessionsTip}
        </p>
      </header>

      {state.status === "error" ? (
        <div className="rounded-[20px] bg-white p-6 shadow-soft">
          <p className="text-sm text-study-muted-soft">{state.message}</p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-study-green"
            onClick={() => {
              setState({ status: "loading", fetchKey: reloadKey });
              setReloadKey((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      {state.status === "ready" && state.sessions.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {state.sessions.map((session) => {
            const meta = [
              paperTypeLabel(session.paperType),
              formatSubmittedAt(session.attemptSubmittedAt),
              session.subjectLabel,
              session.topicLabel,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={session.mockTestId}>
                <Link
                  href={`/mistake-book/${session.mockTestId}`}
                  className="flex min-h-14 flex-col gap-1 rounded-[16px] bg-white px-4 py-4 shadow-soft transition-colors hover:bg-study-mint sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-study-ink">
                      {session.title}
                    </p>
                    {meta ? (
                      <p className="mt-0.5 text-xs text-study-muted-soft sm:text-sm">
                        {meta}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm font-medium text-study-green">
                    {session.remainingCount}{" "}
                    {session.remainingCount === 1 ? "mistake" : "mistakes"} →
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
