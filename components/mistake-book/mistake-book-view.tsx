"use client";

import { useState } from "react";
import {
  MistakePager,
  MistakeRemoveAction,
} from "@/components/mistake-book/mistake-actions";
import { MistakeAnswerCompare } from "@/components/mistake-book/mistake-answer-compare";
import { MistakeFilters } from "@/components/mistake-book/mistake-filters";
import { MistakeInsightCard } from "@/components/mistake-book/mistake-insight-card";
import { MistakeProgress } from "@/components/mistake-book/mistake-progress";
import { MistakeQuestionBlock } from "@/components/mistake-book/mistake-question-block";
import { MistakeRail } from "@/components/mistake-book/mistake-rail";
import { MistakeReviewTimer } from "@/components/mistake-book/mistake-review-timer";
import { MistakeSourceLink } from "@/components/mistake-book/mistake-source-link";
import { MistakeTripTags } from "@/components/mistake-book/mistake-trip-tags";
import {
  chaptersForSubjectFilter,
  filterMistakes,
  progressPercent,
  remainingSubtitle,
} from "@/lib/mistake-book/selectors";
import type {
  MistakeBookPageData,
  MistakeSubjectId,
  MistakeTripReason,
} from "@/types/mistake-book";

type MistakeBookViewProps = {
  data: MistakeBookPageData;
};

export function MistakeBookView({ data }: MistakeBookViewProps) {
  const [subjectId, setSubjectId] = useState<MistakeSubjectId>("all");
  const [chapterId, setChapterId] = useState("all");
  const [removedIds, setRemovedIds] = useState<readonly string[]>([]);
  const [index, setIndex] = useState(0);
  const [tripReason, setTripReason] = useState<MistakeTripReason>(
    data.mistakes[0]?.defaultTripReason ?? "concept-gap"
  );

  const chapterOptions = chaptersForSubjectFilter(data.chapters, subjectId);
  const remaining = filterMistakes(data.mistakes, subjectId, chapterId).filter(
    (mistake) => !removedIds.includes(mistake.id)
  );

  const safeIndex =
    remaining.length === 0 ? 0 : Math.min(index, remaining.length - 1);
  const active = remaining[safeIndex];
  const percent = progressPercent(safeIndex, remaining.length);
  const progressCurrent = remaining.length === 0 ? 0 : safeIndex + 1;

  function syncTripReason(nextIndex: number, list = remaining) {
    const next = list[nextIndex];
    if (next) {
      setTripReason(next.defaultTripReason);
    }
  }

  function handleSubjectChange(nextSubject: MistakeSubjectId) {
    const nextList = filterMistakes(
      data.mistakes,
      nextSubject,
      "all"
    ).filter((mistake) => !removedIds.includes(mistake.id));
    setSubjectId(nextSubject);
    setChapterId("all");
    setIndex(0);
    syncTripReason(0, nextList);
  }

  function handleChapterChange(nextChapter: string) {
    const nextList = filterMistakes(
      data.mistakes,
      subjectId,
      nextChapter
    ).filter((mistake) => !removedIds.includes(mistake.id));
    setChapterId(nextChapter);
    setIndex(0);
    syncTripReason(0, nextList);
  }

  function handleSelectIndex(nextIndex: number) {
    setIndex(nextIndex);
    syncTripReason(nextIndex);
  }

  function handleUnderstood(currentId: string) {
    const nextRemoved = [...removedIds, currentId];
    const nextRemaining = filterMistakes(
      data.mistakes,
      subjectId,
      chapterId
    ).filter((mistake) => !nextRemoved.includes(mistake.id));
    const nextIndex =
      nextRemaining.length === 0
        ? 0
        : Math.min(safeIndex, nextRemaining.length - 1);

    setRemovedIds(nextRemoved);
    setIndex(nextIndex);
    syncTripReason(nextIndex, nextRemaining);
  }

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-8">
      <header className="flex flex-col gap-4 lg:gap-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
              {data.title}
            </h1>
            <p className="mt-1 text-sm whitespace-pre-wrap text-study-muted-soft lg:text-base">
              {remainingSubtitle(data.mockLabel, remaining.length)}
            </p>
          </div>
          <p className="text-[0.6875rem] whitespace-pre text-study-muted-soft">
            {data.examBadge}
          </p>
        </div>

      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)] lg:items-start lg:gap-x-8 lg:gap-y-6">
        <div className="flex flex-col gap-3">
          <MistakeFilters
            subjects={data.subjects}
            chapters={chapterOptions}
            subjectId={subjectId}
            chapterId={chapterId}
            onSubjectChange={handleSubjectChange}
            onChapterChange={handleChapterChange}
          />
          <MistakeProgress
            label={data.mockLabel}
            current={progressCurrent}
            total={remaining.length}
            percent={percent}
          />
        </div>

        {active ? (
          <div className="hidden rounded-[20px] bg-white p-5 shadow-soft lg:block lg:p-6">
            <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
              Review session
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-study-ink">
              {active.questionNumber} · {active.subjectLabel}
            </p>
            <p className="mt-1 text-sm text-study-muted-soft">
              Card {safeIndex + 1} of {remaining.length}. Clear it when the idea
              sticks.
            </p>
          </div>
        ) : null}

        {active ? (
          <>
            <div className="flex min-w-0 flex-col gap-4 lg:min-h-[32rem] lg:gap-6">
              <MistakeReviewTimer
                label={data.timerLabel}
                hint={data.timerHint}
                resetKey={active.id}
              />
              <MistakeQuestionBlock mistake={active} />
              <MistakeAnswerCompare mistake={active} />
              <div className="lg:flex-1">
                <MistakeInsightCard mistake={active} />
              </div>
              <MistakeSourceLink mistake={active} />
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start lg:rounded-[20px] lg:bg-white lg:p-6 lg:shadow-soft lg:gap-6">
              <MistakeTripTags
                prompt={data.tripPrompt}
                options={data.tripReasons}
                value={tripReason}
                onChange={setTripReason}
              />
              <MistakeRail
                mistakes={remaining}
                activeIndex={safeIndex}
                onSelect={handleSelectIndex}
              />
              <MistakePager
                canGoPrevious={safeIndex > 0}
                canGoNext={safeIndex < remaining.length - 1}
                onPrevious={() => handleSelectIndex(safeIndex - 1)}
                onNext={() => handleSelectIndex(safeIndex + 1)}
              />
              <MistakeRemoveAction
                understoodLabel={data.understoodLabel}
                understoodHint={data.understoodHint}
                onUnderstood={() => handleUnderstood(active.id)}
              />
            </aside>
          </>
        ) : (
          <p className="rounded-[20px] bg-white p-6 text-sm text-study-muted-soft shadow-soft lg:col-span-2">
            No mistakes left in this filter. Clear a filter or come back after
            the next mock.
          </p>
        )}
      </div>
    </div>
  );
}
