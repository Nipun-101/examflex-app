"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MathpixBoundary,
  preloadMathpix,
} from "@/components/attempt/mathpix-boundary";
import { ChapterRail } from "@/components/equation-book/chapter-rail";
import { ChapterSelect } from "@/components/equation-book/chapter-select";
import {
  EquationCtas,
  EquationPager,
} from "@/components/equation-book/equation-actions";
import { EquationEmptyState } from "@/components/equation-book/equation-empty-state";
import { EquationFlipCard } from "@/components/equation-book/equation-flip-card";
import { EquationProgress } from "@/components/equation-book/equation-progress";
import { ExamChoiceModal } from "@/components/equation-book/exam-choice-modal";
import { SubjectTabs } from "@/components/equation-book/subject-tabs";
import {
  chapterWiseMockHref,
  resolveEquationExam,
} from "@/lib/equation-book/resolve-exam";
import {
  chaptersFromSubject,
  defaultSubjectAndChapter,
  findCardIndex,
  mockCtaLabel,
  progressPercent,
  subjectsFromCatalog,
} from "@/lib/equation-book/selectors";
import type { ApiSubjectForExam } from "@/types/exam";
import {
  EQUATION_BOOK_COPY,
  type EquationExamOption,
  type EquationItem,
} from "@/types/equation-book";

type EquationBookViewProps = {
  examId: string;
  examName: string;
  availableExams: readonly EquationExamOption[];
  preferredExamId?: string;
  subjects: readonly ApiSubjectForExam[];
  cards: readonly EquationItem[];
  initialSubjectId?: string;
  initialTopicId?: string;
  initialEquationId?: string;
  loadingCards?: boolean;
  onFiltersChange: (next: {
    subjectId: string;
    topicId: string;
  }) => void;
};

export function EquationBookView({
  examId,
  examName,
  availableExams,
  preferredExamId,
  subjects,
  cards,
  initialSubjectId,
  initialTopicId,
  initialEquationId,
  loadingCards = false,
  onFiltersChange,
}: EquationBookViewProps) {
  const router = useRouter();
  const subjectOptions = subjectsFromCatalog(subjects);
  const defaults = defaultSubjectAndChapter(
    subjects,
    initialSubjectId,
    initialTopicId
  );
  const filterSyncKey = `${subjects.map((subject) => subject.id).join(",")}:${initialSubjectId ?? ""}:${initialTopicId ?? ""}`;
  const cardsSyncKey = `${cards.map((card) => card.id).join(",")}:${initialEquationId ?? ""}`;
  const [subjectId, setSubjectId] = useState(defaults.subjectId);
  const [chapterId, setChapterId] = useState(defaults.topicId);
  const [syncedFilterKey, setSyncedFilterKey] = useState(filterSyncKey);
  const [cardIndex, setCardIndex] = useState(() =>
    findCardIndex(cards, initialEquationId)
  );
  const [syncedCardsKey, setSyncedCardsKey] = useState(cardsSyncKey);
  const [revealed, setRevealed] = useState(false);
  const [revealCardKey, setRevealCardKey] = useState<string | null>(null);
  const [mockExamChoices, setMockExamChoices] = useState<
    EquationExamOption[] | null
  >(null);

  useEffect(() => {
    preloadMathpix();
  }, []);

  if (syncedFilterKey !== filterSyncKey) {
    setSyncedFilterKey(filterSyncKey);
    setSubjectId(defaults.subjectId);
    setChapterId(defaults.topicId);
  }

  if (syncedCardsKey !== cardsSyncKey) {
    setSyncedCardsKey(cardsSyncKey);
    setCardIndex(findCardIndex(cards, initialEquationId));
    setRevealed(false);
    setRevealCardKey(null);
  }

  const chapterOptions = chaptersFromSubject(subjects, subjectId);
  const activeChapter =
    chapterOptions.find((chapter) => chapter.id === chapterId) ??
    chapterOptions[0];
  const safeIndex =
    cards.length === 0 ? 0 : Math.min(cardIndex, cards.length - 1);
  const activeCard = cards[safeIndex];
  const activeCardId = activeCard?.id ?? null;
  if (activeCardId !== revealCardKey) {
    setRevealCardKey(activeCardId);
    setRevealed(false);
  }
  const percent = progressPercent(safeIndex, cards.length);

  function handleSubjectChange(nextSubject: string) {
    const nextChapters = chaptersFromSubject(subjects, nextSubject);
    const nextChapterId = nextChapters[0]?.id ?? "";
    setSubjectId(nextSubject);
    setChapterId(nextChapterId);
    setCardIndex(0);
    onFiltersChange({ subjectId: nextSubject, topicId: nextChapterId });
  }

  function handleChapterChange(nextChapterId: string) {
    setChapterId(nextChapterId);
    setCardIndex(0);
    onFiltersChange({ subjectId, topicId: nextChapterId });
  }

  function openMockForActiveCard() {
    if (!activeCard || !activeChapter) return;

    const resolved = resolveEquationExam({
      preferredExamId: preferredExamId ?? examId,
      availableExams,
      allowedExamIds: activeCard.exams.map((exam) => exam.id),
    });

    if (resolved.kind === "resolved") {
      router.push(
        chapterWiseMockHref(
          resolved.exam.id,
          activeCard.subject.id,
          activeCard.topic.id
        )
      );
      return;
    }

    if (resolved.kind === "choose") {
      setMockExamChoices(resolved.exams);
      return;
    }

    router.push("/mocks");
  }

  return (
    <MathpixBoundary>
      <div className="flex w-full min-w-0 flex-col gap-5 lg:gap-8">
        <header className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-[1.75rem] font-semibold tracking-tight break-words text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
                {EQUATION_BOOK_COPY.title}
              </h1>
              <p className="mt-1 text-sm text-study-muted-soft lg:text-base">
                {EQUATION_BOOK_COPY.tagline}
              </p>
            </div>
            <p className="shrink-0 text-[0.6875rem] whitespace-pre text-study-muted-soft">
              {examName}
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2">
            <div className="flex w-full min-w-0 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:items-center lg:gap-4">
              {subjectOptions.length > 0 ? (
                <div className="min-w-0">
                  <SubjectTabs
                    subjects={subjectOptions}
                    activeId={subjectId}
                    onSelect={handleSubjectChange}
                  />
                </div>
              ) : null}
              {activeChapter ? (
                <div className="min-w-0">
                  <ChapterSelect
                    chapters={chapterOptions}
                    value={activeChapter.id}
                    onChange={handleChapterChange}
                  />
                </div>
              ) : null}
            </div>
            {subjectOptions.length > 0 ? (
              <p className="text-[0.6875rem] text-study-muted-soft">
                {EQUATION_BOOK_COPY.filterHint}
              </p>
            ) : null}
          </div>
        </header>

        {loadingCards ? (
          <p className="rounded-[20px] bg-white p-6 text-sm text-study-muted-soft shadow-soft">
            Loading equations…
          </p>
        ) : activeChapter && activeCard ? (
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)] lg:items-stretch lg:gap-8">
            <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:h-full lg:gap-5">
              <EquationProgress
                chapterLabel={activeChapter.label}
                current={safeIndex + 1}
                total={cards.length}
                percent={percent}
              />
              <div className="min-h-0 min-w-0 flex-1">
                <EquationFlipCard
                  key={activeCard.id}
                  card={activeCard}
                  revealed={revealed}
                  onReveal={() => setRevealed(true)}
                />
              </div>
            </div>

            <aside className="flex min-w-0 flex-col gap-5 rounded-[20px] bg-white p-4 shadow-soft sm:p-5 lg:sticky lg:top-6 lg:self-start lg:gap-6 lg:p-6">
              <div className="hidden min-w-0 lg:block">
                <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
                  Recall session
                </p>
                <p className="mt-1 font-display text-lg font-semibold break-words text-study-ink">
                  {activeChapter.label}
                </p>
                <p className="mt-1 text-sm text-study-muted-soft">
                  Card {safeIndex + 1} of {cards.length}. Keep going until the
                  chapter feels automatic.
                </p>
              </div>

              <EquationPager
                canGoPrevious={safeIndex > 0}
                canGoNext={safeIndex < cards.length - 1}
                onPrevious={() =>
                  setCardIndex((value) => Math.max(0, value - 1))
                }
                onNext={() =>
                  setCardIndex((value) =>
                    Math.min(cards.length - 1, value + 1)
                  )
                }
              />

              <ChapterRail
                cards={cards}
                activeIndex={safeIndex}
                onSelect={setCardIndex}
              />

              <EquationCtas
                mockLabel={mockCtaLabel(activeChapter.label)}
                mockHref="#"
                onMockClick={openMockForActiveCard}
                browseLabel={EQUATION_BOOK_COPY.browseLabel}
                browseHref={EQUATION_BOOK_COPY.browseHref}
              />
            </aside>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
            <EquationProgress
              chapterLabel={activeChapter?.label ?? "Chapter"}
              current={0}
              total={0}
              percent={0}
            />
            <EquationEmptyState
              {...(activeChapter?.label
                ? { chapterLabel: activeChapter.label }
                : {})}
            />
          </div>
        )}
      </div>

      <ExamChoiceModal
        open={mockExamChoices != null}
        exams={mockExamChoices ?? []}
        title="Open which exam's mocks?"
        body="This chapter is tagged to more than one exam. Pick one to continue."
        onSelect={(exam) => {
          if (!activeCard) return;
          setMockExamChoices(null);
          router.push(
            chapterWiseMockHref(
              exam.id,
              activeCard.subject.id,
              activeCard.topic.id
            )
          );
        }}
        onDismiss={() => setMockExamChoices(null)}
      />
    </MathpixBoundary>
  );
}
