"use client";

import { useState } from "react";
import { ChapterRail } from "@/components/equation-book/chapter-rail";
import { ChapterSelect } from "@/components/equation-book/chapter-select";
import {
  EquationCtas,
  EquationPager,
} from "@/components/equation-book/equation-actions";
import { EquationProgress } from "@/components/equation-book/equation-progress";
import { EquationRecallCard } from "@/components/equation-book/equation-recall-card";
import { SubjectTabs } from "@/components/equation-book/subject-tabs";
import {
  cardsForChapter,
  chaptersForSubject,
  mockCtaLabel,
  progressPercent,
} from "@/lib/equation-book/selectors";
import type {
  EquationBookPageData,
  EquationSubjectId,
} from "@/types/equation-book";

type EquationBookViewProps = {
  data: EquationBookPageData;
};

export function EquationBookView({ data }: EquationBookViewProps) {
  const initialSubject = data.subjects[0]?.id ?? "physics";
  const initialChapters = chaptersForSubject(data.chapters, initialSubject);
  const initialChapterId = initialChapters[0]?.id ?? "";

  const [subjectId, setSubjectId] =
    useState<EquationSubjectId>(initialSubject);
  const [chapterId, setChapterId] = useState(initialChapterId);
  const [cardIndex, setCardIndex] = useState(0);

  const subjectChapters = chaptersForSubject(data.chapters, subjectId);
  const activeChapter =
    subjectChapters.find((chapter) => chapter.id === chapterId) ??
    subjectChapters[0];
  const chapterCards = activeChapter
    ? cardsForChapter(data.cards, activeChapter.id)
    : [];

  const safeIndex =
    chapterCards.length === 0
      ? 0
      : Math.min(cardIndex, chapterCards.length - 1);
  const activeCard = chapterCards[safeIndex];
  const percent = progressPercent(safeIndex, chapterCards.length);

  function handleSubjectChange(nextSubject: EquationSubjectId) {
    const nextChapters = chaptersForSubject(data.chapters, nextSubject);
    setSubjectId(nextSubject);
    setChapterId(nextChapters[0]?.id ?? "");
    setCardIndex(0);
  }

  function handleChapterChange(nextChapterId: string) {
    setChapterId(nextChapterId);
    setCardIndex(0);
  }

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-8">
      <header className="flex flex-col gap-4 lg:gap-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
              {data.title}
            </h1>
            <p className="mt-1 text-sm text-study-muted-soft lg:text-base">
              {data.tagline}
            </p>
          </div>
          <p className="text-[0.6875rem] whitespace-pre text-study-muted-soft">
            {data.examBadge}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:items-center lg:gap-4">
          <SubjectTabs
            subjects={data.subjects}
            activeId={subjectId}
            onSelect={handleSubjectChange}
          />
          {activeChapter ? (
            <ChapterSelect
              chapters={subjectChapters}
              value={activeChapter.id}
              onChange={handleChapterChange}
            />
          ) : null}
        </div>
      </header>

      {activeChapter && activeCard ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)] lg:items-stretch lg:gap-8">
          <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:h-full lg:gap-5">
            <EquationProgress
              chapterLabel={activeChapter.label}
              current={safeIndex + 1}
              total={chapterCards.length}
              percent={percent}
            />
            <div className="min-h-0 flex-1">
              <EquationRecallCard card={activeCard} />
            </div>
          </div>

          <aside className="flex flex-col gap-5 rounded-[20px] bg-white p-4 shadow-soft sm:p-5 lg:sticky lg:top-6 lg:self-start lg:gap-6 lg:p-6">
            <div className="hidden lg:block">
              <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
                Recall session
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-study-ink">
                {activeChapter.label}
              </p>
              <p className="mt-1 text-sm text-study-muted-soft">
                Card {safeIndex + 1} of {chapterCards.length}. Keep going until
                the chapter feels automatic.
              </p>
            </div>

            <EquationPager
              canGoPrevious={safeIndex > 0}
              canGoNext={safeIndex < chapterCards.length - 1}
              onPrevious={() => setCardIndex((value) => Math.max(0, value - 1))}
              onNext={() =>
                setCardIndex((value) =>
                  Math.min(chapterCards.length - 1, value + 1)
                )
              }
            />

            <ChapterRail
              cards={chapterCards}
              activeIndex={safeIndex}
              onSelect={setCardIndex}
            />

            <EquationCtas
              mockLabel={mockCtaLabel(activeChapter.label)}
              mockHref={data.mockHref}
              browseLabel={data.browseLabel}
              browseHref={data.browseHref}
            />
          </aside>
        </div>
      ) : (
        <p className="rounded-[20px] bg-white p-6 text-sm text-study-muted-soft shadow-soft">
          No equations in this chapter yet. Pick another subject or chapter.
        </p>
      )}
    </div>
  );
}
