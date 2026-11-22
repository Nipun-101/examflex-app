"use client";

import { StudyNavLink } from "@/components/study/study-nav-link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStudyRouter } from "@/hooks/use-study-router";
import {
  MathpixBoundary,
  preloadMathpix,
} from "@/components/attempt/mathpix-boundary";
import { EquationImage } from "@/components/equation-book/equation-image";
import { MathText } from "@/components/attempt/math-text";
import { EquationEmptyState } from "@/components/equation-book/equation-empty-state";
import { EquationPagination } from "@/components/equation-book/equation-pagination";
import { SubjectTabs } from "@/components/equation-book/subject-tabs";
import { StudyButton } from "@/components/study/study-button";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { listEquations } from "@/lib/api/equation-book";
import { optionalField } from "@/lib/api/parse-fields";
import { getSubjectsForExam } from "@/lib/api/exams";
import { getMyProfile } from "@/lib/api/users";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";
import { resolveEquationExam } from "@/lib/equation-book/resolve-exam";
import { subjectsFromCatalog } from "@/lib/equation-book/selectors";
import { persistTargetExam } from "@/lib/profile/persist-target-exam";
import { ExamChoiceModal } from "@/components/equation-book/exam-choice-modal";
import type { ApiSubjectForExam } from "@/types/exam";
import {
  EQUATION_BOOK_COPY,
  type EquationExamOption,
  type EquationItem,
} from "@/types/equation-book";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function EquationBrowseView() {
  const router = useStudyRouter();
  const [bootLoading, setBootLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [hasLoadedList, setHasLoadedList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<EquationExamOption | null>(null);
  const [chooseExams, setChooseExams] = useState<EquationExamOption[] | null>(
    null,
  );
  const [subjects, setSubjects] = useState<ApiSubjectForExam[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<EquationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const scrollToTopAfterLoad = useRef(false);

  useEffect(() => {
    preloadMathpix();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (next === search) return;
      // A changed search starts over from the first page.
      setSearch(next);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setBootLoading(true);
      const [profileResult, exams] = await Promise.all([
        getMyProfile(),
        listShowInAppExams(),
      ]);
      if (cancelled) return;

      const preferred =
        profileResult.ok && profileResult.data.targetExam
          ? profileResult.data.targetExam.id
          : undefined;
      const resolved = resolveEquationExam({
        ...optionalField("preferredExamId", preferred),
        availableExams: exams,
      });

      if (resolved.kind === "resolved") {
        setExam(resolved.exam);
        if (!preferred) {
          void persistTargetExam(resolved.exam.id);
        }
      } else if (resolved.kind === "choose") {
        setChooseExams(resolved.exams);
      } else {
        setError("No exams are available in ExamFlex yet.");
      }
      setBootLoading(false);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!exam) return;
    let cancelled = false;
    void getSubjectsForExam(exam.id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSubjects(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [exam]);

  useEffect(() => {
    if (!exam) return;
    let cancelled = false;

    async function load() {
      setListLoading(true);
      const result = await listEquations({
        examId: exam!.id,
        page,
        limit: PAGE_SIZE,
        ...optionalField("subjectId", subjectId || undefined),
        ...optionalField("search", search || undefined),
      });
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setItems([]);
        setTotalPages(1);
      } else {
        setItems(result.data.items);
        setTotalPages(Math.max(1, result.data.pagination.totalPages));
      }
      setListLoading(false);
      setHasLoadedList(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [exam, subjectId, search, page]);

  useEffect(() => {
    if (listLoading || !scrollToTopAfterLoad.current) return;
    scrollToTopAfterLoad.current = false;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [listLoading]);

  const subjectOptions = useMemo(
    () => [{ id: "", label: "All" }, ...subjectsFromCatalog(subjects)],
    [subjects],
  );
  const activeSubjectLabel =
    subjectOptions.find((subject) => subject.id === subjectId)?.label ?? "All";

  function selectSubject(id: string) {
    setSubjectId(id);
    setPage(1);
  }

  function goToPage(next: number) {
    // Scrolling right now loses to the loading overlay, which locks page
    // scroll the moment the fetch starts (mobile browsers cancel the scroll).
    // Wait for the new page to land and the lock to release, then jump.
    scrollToTopAfterLoad.current = true;
    setPage(next);
  }

  // One shared overlay for the whole page: boot, first list load and every
  // page / filter / search fetch. Until the first list lands (exam picked but
  // nothing fetched yet) it stays up so the empty state never flashes.
  const busy =
    bootLoading || listLoading || (exam !== null && !hasLoadedList && !error);

  // Single StudyRouteLoading instance, always mounted at the same spot, so
  // handing off from boot to list loading never drops or doubles the overlay.
  // It renders nothing of its own inside the shared provider.
  const overlay = <StudyRouteLoading busy={busy} />;

  if (bootLoading) {
    return overlay;
  }

  return (
    <>
      {overlay}
      <MathpixBoundary>
        <div className="flex w-full min-w-0 flex-col gap-5 lg:gap-8">
          <header className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
                  Formula shelf
                </p>
                <h1 className="mt-1 font-display text-[1.75rem] font-semibold tracking-tight break-words text-study-ink sm:text-[2rem]">
                  Browse all equations
                </h1>
                <p className="mt-1 text-sm text-study-muted-soft">
                  Search by title. Jump back into a recall card whenever you
                  want.
                </p>
              </div>
              <StudyNavLink
                href="/equation-book"
                className="my-3 shrink-0 text-sm font-semibold text-study-green hover:text-study-ink sm:my-0"
              >
                ← Back to recall
              </StudyNavLink>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
              <div className="min-w-0 flex-1">
                <SubjectTabs
                  subjects={subjectOptions}
                  activeId={subjectId}
                  onSelect={selectSubject}
                  layout="wrap"
                />
              </div>
              <label className="block w-full min-w-0 shrink-0 sm:w-56 lg:w-64">
                <span className="sr-only">Search equations by title</span>
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by title"
                  className="h-[46px] w-full rounded-[10px] border border-study-divider bg-white px-4 text-[0.875rem] text-study-ink outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink"
                />
              </label>
            </div>
          </header>

          {error && items.length === 0 ? (
            <p className="rounded-[20px] bg-white p-6 text-sm text-study-muted-soft shadow-soft">
              {error}
            </p>
          ) : items.length === 0 && !busy ? (
            <EquationEmptyState chapterLabel={activeSubjectLabel} />
          ) : (
            <ul className="grid min-w-0 gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.id} className="min-w-0">
                  <article className="flex h-full min-w-0 flex-col rounded-[20px] bg-study-lilac px-5 py-5 shadow-soft">
                    <p className="text-[0.625rem] font-semibold tracking-wide break-words text-study-green uppercase">
                      {item.subject.name} · {item.topic.name}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold break-words [overflow-wrap:anywhere] text-study-ink">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm break-words text-study-muted-soft">
                      {item.shortDescription}
                    </p>
                    <div className="mt-4 min-w-0 overflow-x-auto text-base font-medium text-study-ink [-webkit-overflow-scrolling:touch] [&_#preview]:!block [&_#preview]:!max-w-full [&_#preview]:!p-0">
                      <MathText text={item.equation} />
                    </div>
                    {item.imageUrl ? (
                      <div className="mt-4 flex min-w-0 justify-center">
                        <EquationImage
                          src={item.imageUrl}
                          title={item.title}
                          className="max-h-60 w-auto"
                        />
                      </div>
                    ) : null}
                    <div className="mt-auto pt-5">
                      <StudyButton
                        variant="solid"
                        className="inline-flex h-11 items-center justify-center rounded-[10px] px-4 text-[0.8125rem] font-medium"
                        onClick={() => {
                          const params = new URLSearchParams({
                            subjectId: item.subject.id,
                            topicId: item.topic.id,
                            equationId: item.id,
                          });
                          router.push(`/equation-book?${params.toString()}`);
                        }}
                      >
                        Open in recall →
                      </StudyButton>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}

          <EquationPagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            disabled={listLoading}
          />

          <p className="text-right text-[0.625rem] text-study-muted-soft">
            {EQUATION_BOOK_COPY.title} · {exam?.name ?? "ExamFlex"}
          </p>
        </div>

        <ExamChoiceModal
          open={chooseExams != null && exam == null}
          exams={chooseExams ?? []}
          title="Which exam's formulas?"
          body="You don't have a preferred exam yet. Pick one to continue — we'll save it to your profile."
          onSelect={(selected) => {
            setExam(selected);
            setChooseExams(null);
            void persistTargetExam(selected.id);
          }}
        />
      </MathpixBoundary>
    </>
  );
}
