"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { AnswerKeyList } from "@/components/attempt/answer-key-list";
import { LanguageToggle } from "@/components/attempt/language-toggle";
import { MistakeBookCta } from "@/components/attempt/mistake-book-cta";
import { PerformanceBadge } from "@/components/attempt/performance-badge";
import {
  ResultsQuestionMap,
  answerKeyQuestionDomId,
  type ResultsQuestionMapItem,
} from "@/components/attempt/results-question-map";
import { ScoreRing } from "@/components/attempt/score-ring";
import { StudyNavLink } from "@/components/study/study-nav-link";
import { StudyControlLink } from "@/components/study/study-button";
import { buildSectionBreakdown } from "@/lib/mocks/adapt-results";
import { formatTimeTaken } from "@/lib/mocks/attempt-format";
import {
  attemptTitle,
  paperListLabel,
  treatMissingAsFullMock,
} from "@/lib/mocks/attempt-meta";
import {
  examHubPath,
  examTestListPath,
} from "@/lib/mocks/exam-test-routes";
import {
  resultOutcome,
  type ResultOutcome,
} from "@/lib/mocks/result-outcome";
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

type SectionFilter = "all" | number;
type StatusFilter = "all" | ResultOutcome;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wrong", label: "Wrong" },
  { id: "skipped", label: "Skipped" },
  { id: "correct", label: "Correct" },
];

function chipClass(active: boolean): string {
  return active
    ? "border-study-ink bg-study-ink text-white shadow-sm"
    : "border-study-divider bg-white text-study-muted-soft hover:border-study-green/55 hover:bg-study-mint/70 hover:text-study-ink hover:shadow-sm";
}

export function MockTestResults({
  result,
  mockTestData,
  questions,
  answerKeyAvailable,
  initialLanguage = "en",
}: MockTestResultsProps) {
  const [language, setLanguage] = useState<AttemptLanguage>(initialLanguage);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const isMalayalam = language === "ml";

  const resultsByQuestion = useMemo(
    () => new Map(result.questionResults.map((r) => [r.questionId, r])),
    [result.questionResults]
  );
  const sections = useMemo(
    () => buildSectionBreakdown(mockTestData, questions, resultsByQuestion),
    [mockTestData, questions, resultsByQuestion]
  );
  const showSections = sections.length > 1;

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

  const mapItems = useMemo<ResultsQuestionMapItem[]>(
    () =>
      questions.map((question, index) => ({
        paperNumber: index + 1,
        questionId: question._id,
        outcome: resultOutcome(resultsByQuestion.get(question._id)),
      })),
    [questions, resultsByQuestion]
  );

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
    if (!showSections || sectionFilter === "all") return questions;
    const section = sections.find((item) => item.order === sectionFilter);
    if (!section) return questions;
    const ids = new Set(section.questionIds);
    return questions.filter((question) => ids.has(question._id));
  }, [showSections, sectionFilter, questions, sections]);

  const visibleQuestions = useMemo(() => {
    if (statusFilter === "all") return sectionQuestions;
    return sectionQuestions.filter(
      (question) =>
        resultOutcome(resultsByQuestion.get(question._id)) === statusFilter
    );
  }, [sectionQuestions, statusFilter, resultsByQuestion]);

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

  function jumpToQuestion(paperNumber: number) {
    setStatusFilter("all");
    setSectionFilter("all");
    window.requestAnimationFrame(() => {
      document
        .getElementById(answerKeyQuestionDomId(paperNumber))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const summaryCard = (
    <section
      aria-label="Score summary"
      className="rounded-[24px] bg-study-ink p-5 text-white shadow-soft sm:p-6"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <ScoreRing
          earned={result.correctAnswers}
          max={questionTotal}
          tone="onDark"
          ofClassName="text-xs font-medium text-[#a8bdb4]"
          svgClassName="h-[5.5rem] w-[5.5rem] sm:h-28 sm:w-28"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[1.35rem] leading-tight font-bold tracking-tight text-white sm:text-2xl">
            {completedLabel}
          </h1>
          <div className="mt-2.5">
            <PerformanceBadge
              score={result.score}
              totalScore={result.totalScore}
              bands={mockTestData.exam.performanceBands}
              language={language}
              showEmoji={false}
              className="bg-[#efe4c4] px-3 py-1 text-[11px] text-[#5c4528]"
            />
          </div>
          <p className="mt-2.5 truncate text-sm text-[#b7c9c0]">
            {attemptTitle(mockTestData)}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2.5">
        <div className="rounded-[14px] bg-[#d5e8c9] px-2 py-3 text-center sm:px-3">
          <dd className="font-display text-2xl font-bold text-study-green">
            {result.correctAnswers}
          </dd>
          <dt className="mt-0.5 text-[11px] font-semibold tracking-wide text-study-green uppercase">
            Correct
          </dt>
        </div>
        <div className="rounded-[14px] bg-[#f3d4c6] px-2 py-3 text-center sm:px-3">
          <dd className="font-display text-2xl font-bold text-study-peach-ink">
            {result.incorrectAnswers}
          </dd>
          <dt className="mt-0.5 text-[11px] font-semibold tracking-wide text-study-peach-ink uppercase">
            Wrong
          </dt>
        </div>
        <div className="rounded-[14px] bg-[#ebe4d6] px-2 py-3 text-center sm:px-3">
          <dd className="font-display text-2xl font-bold text-study-ink">
            {result.unansweredQuestions}
          </dd>
          <dt className="mt-0.5 text-[11px] font-semibold tracking-wide text-[#6a6358] uppercase">
            Skipped
          </dt>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-study-lime">
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          {accuracy}% accuracy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {formatTimeTaken(result.timeTaken)}
        </span>
      </div>
    </section>
  );

  const sectionBreakdown =
    showSections ? (
      <section
        aria-label="Section-wise score"
        className="rounded-[20px] border border-study-divider bg-white p-4 shadow-soft sm:p-5"
      >
        <h2 className="mb-3 font-display text-sm font-bold text-study-ink">
          Section-wise score
        </h2>

        <ul className="space-y-2 lg:space-y-2">
          {sections.map((section) => (
            <li key={section.order}>
              <button
                type="button"
                onClick={() => {
                  setSectionFilter(section.order);
                  setStatusFilter("all");
                }}
                aria-pressed={sectionFilter === section.order}
                className={`w-full cursor-pointer rounded-[14px] border p-3 text-left transition-colors ${
                  sectionFilter === section.order
                    ? "border-study-green bg-study-mint/60"
                    : "border-study-divider bg-study-canvas/70 hover:border-study-green/40"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-sm leading-snug font-semibold break-words text-study-ink">
                    {section.name}
                  </span>
                  {section.timeConsumed > 0 ? (
                    <span className="shrink-0 pt-0.5 text-[11px] text-study-muted-soft tabular-nums">
                      {formatTimeTaken(section.timeConsumed)}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                  <span className="rounded-lg bg-study-mint px-2 py-1.5">
                    <span className="block text-sm font-bold text-study-green">
                      {section.correct}
                    </span>
                    <span className="block text-[10px] text-study-green">
                      Correct
                    </span>
                  </span>
                  <span className="rounded-lg bg-study-peach px-2 py-1.5">
                    <span className="block text-sm font-bold text-study-peach-ink">
                      {section.wrong}
                    </span>
                    <span className="block text-[10px] text-study-peach-ink">
                      Wrong
                    </span>
                  </span>
                  <span className="rounded-lg border border-study-divider bg-white px-2 py-1.5">
                    <span className="block text-sm font-bold text-study-ink">
                      {section.skipped}
                    </span>
                    <span className="block text-[10px] text-study-muted-soft">
                      Skipped
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  const answerKey = (
    <section aria-labelledby="answer-key-heading" className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 lg:flex-row lg:items-center lg:justify-between">
        <h2
          id="answer-key-heading"
          className="font-display text-lg font-bold text-study-ink sm:text-xl"
        >
          {isMalayalam ? "ഉത്തരക്കുറിപ്പ്" : "Answer Key"}
        </h2>

        {answerKeyAvailable ? (
          <div
            role="group"
            aria-label="Filter answer key by result"
            className="flex gap-1.5 overflow-x-auto pb-1"
          >
            {STATUS_FILTERS.map((filter) => {
              const count = statusCounts[filter.id];
              const active = statusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  aria-pressed={active}
                  className={`h-10 shrink-0 cursor-pointer rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors ${chipClass(active)}`}
                >
                  {filter.label} {count}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {answerKeyAvailable && showSections ? (
        <div
          role="group"
          aria-label="Filter answer key by section"
          className="mb-4 flex gap-1.5 overflow-x-auto pb-1"
        >
          <button
            type="button"
            onClick={() => setSectionFilter("all")}
            aria-pressed={sectionFilter === "all"}
            className={`h-10 shrink-0 cursor-pointer rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors ${chipClass(sectionFilter === "all")}`}
          >
            All sections ({questions.length})
          </button>
          {sections.map((section) => (
            <button
              key={section.order}
              type="button"
              onClick={() => setSectionFilter(section.order)}
              aria-pressed={sectionFilter === section.order}
              className={`h-10 shrink-0 cursor-pointer rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors ${chipClass(sectionFilter === section.order)}`}
            >
              {section.name} ({section.questionIds.length})
            </button>
          ))}
        </div>
      ) : null}

      {answerKeyAvailable ? (
        <AnswerKeyList
          questions={visibleQuestions}
          resultsByQuestion={resultsByQuestion}
          paperIndexById={paperIndexById}
          sectionByQuestionId={sectionByQuestionId}
          showSectionHeadings={showSections && sectionFilter === "all"}
          language={language}
        />
      ) : (
        <div className="rounded-[20px] border border-study-divider bg-white px-4 py-8 text-center shadow-soft">
          <p className="text-sm text-study-muted-soft">
            The answer key for this paper isn&apos;t available yet.
          </p>
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-dvh bg-study-canvas py-4 sm:py-6 lg:py-8">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <StudyNavLink
            href={examHref}
            className="inline-flex h-11 items-center gap-1.5 rounded-[10px] px-1.5 text-sm font-semibold text-study-green transition-colors hover:bg-study-mint/70"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {isMalayalam ? "പരീക്ഷയിലേക്ക്" : "Back to Exam"}
          </StudyNavLink>
          {mockTestData.exam.hasMultiLingualSupport ? (
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          ) : null}
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8">
          <aside className="mb-5 space-y-4 lg:sticky lg:top-4 lg:mb-0 lg:self-start">
            {summaryCard}
            <MistakeBookCta
              mockTestId={mockTestData.mockTestId}
              mistakeCount={result.incorrectAnswers + result.unansweredQuestions}
            />
            {answerKeyAvailable ? (
              <ResultsQuestionMap items={mapItems} onJump={jumpToQuestion} />
            ) : null}
            {sectionBreakdown}
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
    </div>
  );
}
