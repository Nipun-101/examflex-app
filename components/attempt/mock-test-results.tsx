"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Clock,
} from "lucide-react";
import { AnswerKeyList } from "@/components/attempt/answer-key-list";
import { LanguageToggle } from "@/components/attempt/language-toggle";
import { MistakeBookCta } from "@/components/attempt/mistake-book-cta";
import { PerformanceBadge } from "@/components/attempt/performance-badge";
import {
  ResultsMiniSummary,
  ResultsSummaryBar,
} from "@/components/attempt/results-compact-summary";
import {
  QuestionMapPill,
  ResultsMapSheet,
} from "@/components/attempt/results-map-sheet";
import {
  ResultsQuestionMap,
  type ResultsMapGroup,
  type ResultsQuestionMapItem,
  type ResultsStatusFilter,
} from "@/components/attempt/results-question-map";
import { ScoreRing } from "@/components/attempt/score-ring";
import { StudyNavLink } from "@/components/study/study-nav-link";
import { StudyControlLink } from "@/components/study/study-button";
import {
  buildSectionBreakdown,
  buildSubjectBreakdown,
} from "@/lib/mocks/adapt-results";
import { formatScore, formatTimeTaken } from "@/lib/mocks/attempt-format";
import {
  attemptTitle,
  paperListLabel,
  treatMissingAsFullMock,
} from "@/lib/mocks/attempt-meta";
import {
  examHubPath,
  examTestListPath,
  mistakeBookPath,
} from "@/lib/mocks/exam-test-routes";
import { resultOutcome } from "@/lib/mocks/result-outcome";
import type {
  AttemptLanguage,
  AttemptMockTestData,
  AttemptQuestion,
  SubmitAttemptResult,
} from "@/types/attempt";

type MockTestResultsProps = {
  result: SubmitAttemptResult;
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
  /** False when the paper keeps its answer key hidden. */
  answerKeyAvailable: boolean;
  initialLanguage?: AttemptLanguage;
};

const LINK_CLASS =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] px-5 text-sm font-semibold";

/** A question counts as "current" once its top edge passes this line (px). */
const CURRENT_QUESTION_OFFSET = 140;

export function MockTestResults({
  result,
  mockTestData,
  questions,
  answerKeyAvailable,
  initialLanguage = "en",
}: MockTestResultsProps) {
  const [language, setLanguage] = useState<AttemptLanguage>(initialLanguage);
  const [sectionFilter, setSectionFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ResultsStatusFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [summaryOutOfView, setSummaryOutOfView] = useState(false);
  const [scrolledToNumber, setScrolledToNumber] = useState<number | null>(null);
  const [jumpRequest, setJumpRequest] = useState<{
    paperNumber: number;
    seq: number;
  } | null>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const isMalayalam = language === "ml";

  const resultsByQuestion = useMemo(
    () => new Map(result.questionResults.map((r) => [r.questionId, r])),
    [result.questionResults]
  );
  // Sessions win; papers without them fall back to each question's subject.
  const sections = useMemo(() => {
    const bySession = buildSectionBreakdown(
      mockTestData,
      questions,
      resultsByQuestion
    );
    return bySession.length > 1
      ? bySession
      : buildSubjectBreakdown(questions, resultsByQuestion);
  }, [mockTestData, questions, resultsByQuestion]);
  const showSections = sections.length > 1;
  // A stale selection (section vanished) behaves as "nothing selected".
  const activeSection =
    sectionFilter === null
      ? undefined
      : sections.find((section) => section.order === sectionFilter);
  const activeSectionOrder = activeSection?.order ?? null;

  const paperIndexById = useMemo(
    () => new Map(questions.map((question, index) => [question._id, index])),
    [questions]
  );
  const sectionByQuestionId = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of sections) {
      for (const id of section.questionIds) map.set(id, section.name);
    }
    return map;
  }, [sections]);

  const mapItemById = useMemo(() => {
    const map = new Map<string, ResultsQuestionMapItem>();
    questions.forEach((question, index) => {
      map.set(question._id, {
        paperNumber: index + 1,
        questionId: question._id,
        outcome: resultOutcome(resultsByQuestion.get(question._id)),
      });
    });
    return map;
  }, [questions, resultsByQuestion]);

  const statusCounts = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    for (const question of questions) {
      const outcome = resultOutcome(resultsByQuestion.get(question._id));
      if (outcome === "correct") correct += 1;
      else if (outcome === "wrong") wrong += 1;
      else skipped += 1;
    }
    return { all: questions.length, correct, wrong, skipped };
  }, [questions, resultsByQuestion]);

  const sectionQuestions = useMemo(() => {
    if (!activeSection) return questions;
    const ids = new Set(activeSection.questionIds);
    return questions.filter((question) => ids.has(question._id));
  }, [activeSection, questions]);

  const visibleQuestions = useMemo(() => {
    if (statusFilter === "all") return sectionQuestions;
    return sectionQuestions.filter(
      (question) =>
        resultOutcome(resultsByQuestion.get(question._id)) === statusFilter
    );
  }, [sectionQuestions, statusFilter, resultsByQuestion]);

  const mapGroups = useMemo<ResultsMapGroup[]>(() => {
    const matches = (item: ResultsQuestionMapItem) =>
      statusFilter === "all" || item.outcome === statusFilter;

    if (!showSections) {
      const items = [...mapItemById.values()].filter(matches);
      return items.length > 0 ? [{ id: "all", items }] : [];
    }

    return sections
      .filter((section) => !activeSection || section.order === activeSection.order)
      .map((section) => {
        const all = section.questionIds.flatMap((id) => {
          const item = mapItemById.get(id);
          return item ? [item] : [];
        });
        const numbers = all.map((item) => item.paperNumber);
        return {
          id: String(section.order),
          name: section.name,
          ...(numbers.length > 0
            ? { rangeLabel: `${Math.min(...numbers)}–${Math.max(...numbers)}` }
            : {}),
          summary: `${section.correct} correct · ${section.wrong} wrong · ${section.skipped} skipped`,
          items: all.filter(matches),
        };
      })
      .filter((group) => group.items.length > 0);
  }, [showSections, sections, activeSection, statusFilter, mapItemById]);

  const sectionChips = useMemo(
    () =>
      showSections
        ? sections.map((section) => ({ id: section.order, name: section.name }))
        : [],
    [showSections, sections]
  );

  // The "you are here" question: last one whose top edge has passed the line,
  // else the first one in the (filtered) list.
  const firstVisibleNumber = visibleQuestions[0]
    ? (paperIndexById.get(visibleQuestions[0]._id) ?? 0) + 1
    : null;
  const visibleNumbers = useMemo(
    () =>
      new Set(
        visibleQuestions.map((question) => (paperIndexById.get(question._id) ?? 0) + 1)
      ),
    [visibleQuestions, paperIndexById]
  );
  const currentNumber =
    scrolledToNumber !== null && visibleNumbers.has(scrolledToNumber)
      ? scrolledToNumber
      : firstVisibleNumber;

  useEffect(() => {
    if (!answerKeyAvailable) return;
    let frame = 0;
    function update() {
      frame = 0;
      const articles = document.querySelectorAll<HTMLElement>(
        "[data-answer-key-q]"
      );
      let found: number | null = null;
      for (const article of articles) {
        if (article.getBoundingClientRect().top > CURRENT_QUESTION_OFFSET) break;
        found = Number(article.dataset.answerKeyQ);
      }
      setScrolledToNumber(found);
    }
    function onScroll() {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [answerKeyAvailable]);

  // Swap the full result card for compact summaries once it scrolls away.
  useEffect(() => {
    const element = summaryRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setSummaryOutOfView(
        !entry.isIntersecting && entry.boundingClientRect.bottom < 0
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const totalAttempted = result.correctAnswers + result.incorrectAnswers;
  const accuracy =
    totalAttempted > 0
      ? ((result.correctAnswers / totalAttempted) * 100).toFixed(1)
      : "0";

  const missingAsFullMock = treatMissingAsFullMock(mockTestData);
  const examId = mockTestData.exam.id;
  const listLabel = paperListLabel(mockTestData.paperType, missingAsFullMock);
  const listHref = examId
    ? examTestListPath(examId, mockTestData.paperType, {
        treatMissingAsFullMock: missingAsFullMock,
      })
    : "/mocks";
  const examHref = examId ? examHubPath(examId) : "/mocks";
  const completedLabel = isMalayalam
    ? "ടെസ്റ്റ് പൂർത്തിയായി"
    : "Test Completed";
  const questionTotal =
    questions.length ||
    result.correctAnswers + result.incorrectAnswers + result.unansweredQuestions;
  // Shrink the ring value as it gets longer so it stays inside the arc.
  const scoreChars = Math.max(
    formatScore(result.score).length,
    formatScore(result.totalScore).length + 1
  );
  const ringValueClass =
    scoreChars <= 3
      ? "font-display text-2xl font-bold text-white sm:text-3xl"
      : scoreChars === 4
        ? "font-display text-xl font-bold text-white sm:text-2xl"
        : "font-display text-base font-bold text-white sm:text-xl";
  const mistakeCount = result.incorrectAnswers + result.unansweredQuestions;
  const timeLabel = formatTimeTaken(result.timeTaken);
  const paperTitle = attemptTitle(mockTestData);
  const filtersActive = statusFilter !== "all" || activeSection !== undefined;

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  function clearFilters() {
    setStatusFilter("all");
    setSectionFilter(null);
  }

  function jumpToQuestion(paperNumber: number) {
    setSheetOpen(false);
    setScrolledToNumber(paperNumber);
    setJumpRequest((prev) => ({ paperNumber, seq: (prev?.seq ?? 0) + 1 }));
  }

  const summaryCard = (
    <section
      ref={summaryRef}
      aria-label="Score summary"
      className="rounded-[28px] bg-[#1b3d35] p-5 text-white shadow-soft"
    >
      <div className="flex items-center gap-[18px]">
        <ScoreRing
          earned={result.score}
          max={result.totalScore}
          tone="onDark"
          valueClassName={ringValueClass}
          ofClassName="text-xs font-medium text-[#a8bdb4]"
          svgClassName="size-[5.75rem]"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[1.35rem] leading-tight font-bold tracking-tight text-white sm:text-2xl">
            {completedLabel}
          </h1>
          <div className="mt-2 mb-1.5">
            <PerformanceBadge
              score={result.score}
              totalScore={result.totalScore}
              bands={mockTestData.exam.performanceBands}
              language={language}
              showEmoji={false}
              className="rounded-[12px] bg-[#f6e7b4] px-3 py-[5px] text-xs text-[#6b4e00]"
            />
          </div>
          <p className="truncate text-[13px] font-medium text-[#c5d6cc]">
            {paperTitle}
          </p>
        </div>
      </div>

      <dl className="mt-3.5 grid grid-cols-3 gap-2.5">
        <div className="rounded-[14px] bg-[#d5e8cf] px-1.5 py-2.5 text-center">
          <dd className="font-display text-2xl font-extrabold text-study-green">
            {result.correctAnswers}
          </dd>
          <dt className="text-[11px] font-semibold tracking-[0.06em] text-study-green uppercase">
            Correct
          </dt>
        </div>
        <div className="rounded-[14px] bg-[#f4d6cb] px-1.5 py-2.5 text-center">
          <dd className="font-display text-2xl font-extrabold text-[#8a3f2a]">
            {result.incorrectAnswers}
          </dd>
          <dt className="text-[11px] font-semibold tracking-[0.06em] text-[#8a3f2a] uppercase">
            Wrong
          </dt>
        </div>
        <div className="rounded-[14px] bg-[#e9e3d6] px-1.5 py-2.5 text-center">
          <dd className="font-display text-2xl font-extrabold text-study-muted-soft">
            {result.unansweredQuestions}
          </dd>
          <dt className="text-[11px] font-semibold tracking-[0.06em] text-study-muted-soft uppercase">
            Skipped
          </dt>
        </div>
      </dl>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-[18px] gap-y-2 text-[13px] font-medium text-[#ddeba0]">
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          {accuracy}% accuracy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {timeLabel}
        </span>
      </div>

      <StudyNavLink
        href="/analysis"
        className="group mt-4 flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.07] p-3.5 transition-colors hover:border-[#ddeba0]/40 hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ddeba0]"
      >
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ddeba0] text-[#1b3d35]"
        >
          <BarChart3 className="size-[18px]" strokeWidth={2.4} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-white">
            See your full analysis
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-[#c5d6cc]">
            Find weak chapters and track your progress over time
          </span>
        </span>
        <ArrowRight
          className="size-5 shrink-0 text-[#ddeba0] transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </StudyNavLink>
    </section>
  );

  const compactSummary = {
    correct: result.correctAnswers,
    wrong: result.incorrectAnswers,
    skipped: result.unansweredQuestions,
    total: questionTotal,
    accuracy,
    title: completedLabel,
    subtitle: paperTitle,
  };

  const answerKey = (
    <section aria-labelledby="answer-key-heading" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="answer-key-heading"
          className="font-display text-2xl font-bold text-study-ink"
        >
          {isMalayalam ? "ഉത്തരക്കുറിപ്പ്" : "Answer Key"}
        </h2>
        {answerKeyAvailable && filtersActive ? (
          <p className="flex items-center gap-2 text-sm text-study-muted-soft">
            <span>
              Showing {visibleQuestions.length} of {questions.length}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer font-semibold text-study-green underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </p>
        ) : null}
      </div>

      {answerKeyAvailable ? (
        visibleQuestions.length > 0 ? (
          <AnswerKeyList
            questions={visibleQuestions}
            resultsByQuestion={resultsByQuestion}
            paperIndexById={paperIndexById}
            sectionByQuestionId={sectionByQuestionId}
            showSectionHeadings={showSections && activeSection === undefined}
            language={language}
            jumpRequest={jumpRequest}
          />
        ) : (
          <div className="rounded-[24px] border border-study-divider bg-white px-4 py-8 text-center shadow-soft">
            <p className="text-sm text-study-muted-soft">
              No questions match these filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 cursor-pointer text-sm font-semibold text-study-green hover:underline"
            >
              Clear filters
            </button>
          </div>
        )
      ) : (
        <div className="rounded-[24px] border border-study-divider bg-white px-4 py-8 text-center shadow-soft">
          <p className="text-sm text-study-muted-soft">
            The answer key for this paper isn&apos;t available yet.
          </p>
        </div>
      )}
    </section>
  );

  const mapFilterProps = {
    statusFilter,
    onStatusChange: setStatusFilter,
    statusCounts,
    sections: sectionChips,
    sectionFilter: activeSectionOrder,
    onSectionChange: setSectionFilter,
  };

  return (
    <div className="min-h-dvh bg-study-canvas py-4 pb-28 sm:py-6 lg:py-8 lg:pb-8">
      {answerKeyAvailable && summaryOutOfView ? (
        <ResultsSummaryBar {...compactSummary} />
      ) : null}

      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <StudyNavLink
            href={examHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-study-divider bg-white px-[18px] text-sm font-semibold text-study-green transition-colors hover:bg-study-mint/70"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {isMalayalam ? "പരീക്ഷയിലേക്ക്" : "Back to Exam"}
          </StudyNavLink>
          {mockTestData.exam.hasMultiLingualSupport ? (
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          ) : null}
        </div>

        <div className="lg:grid lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-6">
          <aside className="mb-5 space-y-4 lg:mb-0">
            {summaryCard}
            <MistakeBookCta
              mockTestId={mockTestData.mockTestId}
              mistakeCount={mistakeCount}
            />
            {answerKeyAvailable ? (
              <div className="sticky top-4 hidden lg:block">
                <ResultsQuestionMap
                  {...mapFilterProps}
                  groups={mapGroups}
                  currentPaperNumber={currentNumber}
                  onJump={jumpToQuestion}
                  miniSummary={
                    summaryOutOfView ? (
                      <ResultsMiniSummary
                        {...compactSummary}
                        timeLabel={timeLabel}
                      />
                    ) : null
                  }
                />
              </div>
            ) : null}
          </aside>

          <div className="min-w-0">{answerKey}</div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 pb-8 lg:mt-10">
          <StudyControlLink
            href="/mocks"
            variant="surface"
            className={`${LINK_CLASS} min-w-[11rem]`}
          >
            Back to Mocks
          </StudyControlLink>
          <StudyControlLink
            href={listHref}
            variant="solid"
            className={`${LINK_CLASS} min-w-[11rem]`}
          >
            More {listLabel}
          </StudyControlLink>
        </div>
      </div>

      {answerKeyAvailable ? (
        <>
          {!sheetOpen ? (
            <QuestionMapPill
              currentPaperNumber={currentNumber}
              total={questionTotal}
              onOpen={() => setSheetOpen(true)}
            />
          ) : null}
          <ResultsMapSheet
            open={sheetOpen}
            onClose={closeSheet}
            correct={result.correctAnswers}
            total={questionTotal}
            accuracy={accuracy}
            timeLabel={timeLabel}
            {...mapFilterProps}
            sections={sectionChips}
            groups={mapGroups}
            currentPaperNumber={currentNumber}
            onJump={jumpToQuestion}
            {...(mockTestData.mockTestId
              ? { mistakeHref: mistakeBookPath(mockTestData.mockTestId) }
              : {})}
            mistakeCount={mistakeCount}
          />
        </>
      ) : null}
    </div>
  );
}
