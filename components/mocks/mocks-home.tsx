"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import {
  CategoryPager,
  categoryPagerHint,
} from "@/components/mocks/category-pager";
import { ExamFeatureCard } from "@/components/mocks/exam-feature-card";
import { MocksStaticSections } from "@/components/mocks/mocks-static-sections";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { useStudyRouter } from "@/hooks/use-study-router";
import { getExamsByCategory } from "@/lib/api/exams";
import type {
  ApiCategoryPagination,
  ApiExamCategory,
} from "@/types/exam";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string; fetchKey: string }
  | {
      status: "ready";
      category: ApiExamCategory | null;
      pagination: ApiCategoryPagination;
      fetchKey: string;
    };

function readPage(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("page") || "1");
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

export function MocksHome() {
  const router = useStudyRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = readPage(searchParams);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const fetchKey = `${page}:${reloadKey}`;

  const load = useCallback(async (nextPage: number, key: string) => {
    const result = await getExamsByCategory({ page: nextPage, limit: 1 });
    if (!result.ok) {
      return {
        status: "error" as const,
        message: result.message,
        fetchKey: key,
      };
    }
    return {
      status: "ready" as const,
      category: result.data.categories[0] ?? null,
      pagination: result.data.pagination,
      fetchKey: key,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const key = fetchKey;
    void load(page, key).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load, page, fetchKey]);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleRetry() {
    setReloadKey((value) => value + 1);
  }

  const isLoading =
    state.status === "loading" || state.fetchKey !== fetchKey;

  const pager =
    state.status === "ready" ? (
      <CategoryPager
        page={state.pagination.page}
        totalPages={state.pagination.totalPages}
        hasPrevPage={state.pagination.hasPrevPage}
        hasNextPage={state.pagination.hasNextPage}
        onPrev={() => goToPage(state.pagination.page - 1)}
        onNext={() => goToPage(state.pagination.page + 1)}
      />
    ) : null;

  const hint =
    state.status === "ready" && state.pagination.totalPages > 1
      ? categoryPagerHint(state.pagination.page, state.pagination.totalPages)
      : null;

  if (isLoading) {
    return (
      <>
        <MocksHomeHeader pager={null} hint={null} />
        <StudyRouteLoading busy />
      </>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-6">
        <MocksHomeHeader pager={null} hint={null} />
        <div
          role="alert"
          className="rounded-[14px] border border-study-divider bg-white px-4 py-6 text-center"
        >
          <p className="text-sm text-study-ink">{state.message}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 inline-flex h-11 min-w-[11rem] items-center justify-center gap-2 rounded-[10px] bg-study-green px-4 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!state.category) {
    return (
      <div className="space-y-8">
        <MocksHomeHeader pager={pager} hint={hint} />
        <p className="rounded-[14px] border border-study-divider bg-white px-4 py-8 text-center text-sm text-study-muted-soft">
          Mock exams will show up here once they are published.
        </p>
        <MocksStaticSections />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MocksHomeHeader pager={pager} hint={hint} />

      <section aria-labelledby="mocks-category-heading" className="space-y-4">
        <h2
          id="mocks-category-heading"
          className="font-display text-sm font-bold tracking-wide text-study-ink uppercase sm:text-base"
        >
          {state.category.name}
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {state.category.exams.map((exam) => (
            <li key={exam.id} className="min-w-0">
              <ExamFeatureCard exam={exam} />
            </li>
          ))}
        </ul>
      </section>

      <MocksStaticSections />
    </div>
  );
}

function MocksHomeHeader({
  pager,
  hint,
}: {
  pager: ReactNode;
  hint: string | null;
}) {
  return (
    <header className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
            Practice
          </p>
          <h1 className="mt-1 font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem]">
            Mocks
          </h1>
        </div>
        {pager}
      </div>
      <p className="max-w-xl text-sm text-study-muted-soft">
        Pick an exam to open chapter-wise papers, full mocks, and sprint tests.
      </p>
      {hint ? (
        <p className="text-xs text-study-muted-soft" role="note">
          {hint}
        </p>
      ) : null}
    </header>
  );
}
