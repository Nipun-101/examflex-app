"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { AnswerKeyList } from "@/components/attempt/answer-key-list";
import { LanguageToggle } from "@/components/attempt/language-toggle";
import { PerformanceBadge } from "@/components/attempt/performance-badge";
import { ScoreRing } from "@/components/attempt/score-ring";
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

export function MockTestResults({
  result,
  mockTestData,
  questions,
  answerKeyAvailable,
  initialLanguage = "en",
}: MockTestResultsProps) {
  const [language, setLanguage] = useState<AttemptLanguage>(initialLanguage);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
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

  const visibleQuestions = useMemo(() => {
    if (!showSections || sectionFilter === "all") return questions;
    const section = sections.find((item) => item.order === sectionFilter);
    if (!section) return questions;
    const ids = new Set(section.questionIds);
    return questions.filter((question) => ids.has(question._id));
  }, [showSections, sectionFilter, questions, sections]);

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
  const badge = (
    <PerformanceBadge
      score={result.score}
      totalScore={result.totalScore}
      bands={mockTestData.exam.performanceBands}
      language={language}
    />
  );

  return (
    <div className="min-h-dvh bg-study-canvas py-4 sm:py-8">
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <StudyControlLink
            href={examHref}
            variant="outline"
            className={`${LINK_CLASS} px-3`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {isMalayalam ? "പരീക്ഷയിലേക്ക്" : "Back to Exam"}
          </StudyControlLink>
          {mockTestData.exam.hasMultiLingualSupport ? (
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          ) : null}
        </div>

        <section
          aria-label="Score summary"
          className="mb-4 rounded-[16px] border border-study-divider bg-white p-4 sm:mb-6 sm:p-6"
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <ScoreRing earned={result.score} max={result.totalScore} />

            <div className="w-full flex-1 text-center sm:text-left">
              <div className="mb-1 flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <h1 className="font-display text-xl font-bold whitespace-nowrap text-study-ink">
                  {completedLabel}
                </h1>
                {badge}
              </div>
              <p className="mb-3 truncate text-sm text-study-muted-soft">
                {attemptTitle(mockTestData)}
              </p>

              <dl className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-study-mint px-2.5 py-2">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-study-green"
                    aria-hidden
                  />
                  <div className="min-w-0 text-left">
                    <dd className="font-display text-base leading-tight font-bold text-study-green sm:text-lg">
                      {result.correctAnswers}
                    </dd>
                    <dt className="text-[10px] text-study-green sm:text-xs">Correct</dt>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-study-peach px-2.5 py-2">
                  <XCircle
                    className="h-4 w-4 shrink-0 text-study-peach-ink"
                    aria-hidden
                  />
                  <div className="min-w-0 text-left">
                    <dd className="font-display text-base leading-tight font-bold text-study-peach-ink sm:text-lg">
                      {result.incorrectAnswers}
                    </dd>
                    <dt className="text-[10px] text-study-peach-ink sm:text-xs">Wrong</dt>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-study-canvas px-2.5 py-2">
                  <Circle
                    className="h-4 w-4 shrink-0 text-study-muted-soft"
                    aria-hidden
                  />
                  <div className="min-w-0 text-left">
                    <dd className="font-display text-base leading-tight font-bold text-study-ink sm:text-lg">
                      {result.unansweredQuestions}
                    </dd>
                    <dt className="text-[10px] text-study-muted-soft sm:text-xs">
                      Skipped
                    </dt>
                  </div>
                </div>
              </dl>

              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-study-muted-soft sm:justify-start sm:text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-study-green" aria-hidden />
                  {accuracy}% accuracy
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-study-green" aria-hidden />
                  {formatTimeTaken(result.timeTaken)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {showSections ? (
          <section
            aria-label="Section-wise score"
            className="mb-4 rounded-[16px] border border-study-divider bg-white p-4 sm:mb-6 sm:p-5"
          >
            <h2 className="mb-3 font-display text-sm font-bold text-study-ink">
              Section-wise score
            </h2>

            <ul className="space-y-2 sm:hidden">
              {sections.map((section) => (
                <li key={section.order}>
                  <button
                    type="button"
                    onClick={() => setSectionFilter(section.order)}
                    className="w-full cursor-pointer rounded-xl border border-study-divider bg-study-canvas p-3 text-left"
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
                        <span className="block text-[10px] text-study-green">Correct</span>
                      </span>
                      <span className="rounded-lg bg-study-peach px-2 py-1.5">
                        <span className="block text-sm font-bold text-study-peach-ink">
                          {section.wrong}
                        </span>
                        <span className="block text-[10px] text-study-peach-ink">Wrong</span>
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

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-study-divider text-[11px] tracking-wide text-study-muted-soft uppercase">
                    <th scope="col" className="py-2 pr-3 text-left font-semibold">
                      Section
                    </th>
                    <th scope="col" className="px-2 py-2 text-right font-semibold whitespace-nowrap text-study-green">
                      Correct
                    </th>
                    <th scope="col" className="px-2 py-2 text-right font-semibold whitespace-nowrap text-study-peach-ink">
                      Wrong
                    </th>
                    <th scope="col" className="px-2 py-2 text-right font-semibold whitespace-nowrap">
                      Skipped
                    </th>
                    <th scope="col" className="py-2 pl-2 text-right font-semibold whitespace-nowrap">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr
                      key={section.order}
                      className="border-b border-study-divider/60 last:border-0"
                    >
                      <th scope="row" className="py-2.5 pr-3 text-left leading-snug font-medium text-study-ink">
                        {section.name}
                      </th>
                      <td className="px-2 py-2.5 text-right font-semibold text-study-green">
                        {section.correct}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-study-peach-ink">
                        {section.wrong}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-study-muted-soft">
                        {section.skipped}
                      </td>
                      <td className="py-2.5 pl-2 text-right whitespace-nowrap text-study-muted-soft tabular-nums">
                        {section.timeConsumed > 0
                          ? formatTimeTaken(section.timeConsumed)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section
          aria-labelledby="answer-key-heading"
          className="mb-6 rounded-[16px] border border-study-divider bg-white p-4 sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-3 sm:mb-6">
            <h2
              id="answer-key-heading"
              className="font-display text-lg font-bold text-study-ink sm:text-xl"
            >
              {isMalayalam ? "ഉത്തരക്കുറിപ്പ്" : "Answer Key"}
            </h2>
            {answerKeyAvailable && showSections ? (
              <div
                role="group"
                aria-label="Filter answer key by section"
                className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap"
              >
                <button
                  type="button"
                  onClick={() => setSectionFilter("all")}
                  aria-pressed={sectionFilter === "all"}
                  className={`h-11 shrink-0 cursor-pointer rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors sm:h-9 ${
                    sectionFilter === "all"
                      ? "border-study-green bg-study-green text-white"
                      : "border-study-divider bg-white text-study-muted-soft hover:border-study-green/50 hover:text-study-ink"
                  }`}
                >
                  All ({questions.length})
                </button>
                {sections.map((section) => (
                  <button
                    key={section.order}
                    type="button"
                    onClick={() => setSectionFilter(section.order)}
                    aria-pressed={sectionFilter === section.order}
                    className={`h-11 shrink-0 cursor-pointer rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors sm:h-9 ${
                      sectionFilter === section.order
                        ? "border-study-green bg-study-green text-white"
                        : "border-study-divider bg-white text-study-muted-soft hover:border-study-green/50 hover:text-study-ink"
                    }`}
                  >
                    {section.name} ({section.questionIds.length})
                  </button>
                ))}
              </div>
            ) : null}
          </div>

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
            <p className="py-6 text-center text-sm text-study-muted-soft">
              The answer key for this paper isn&apos;t available yet.
            </p>
          )}
        </section>

        <div className="flex flex-wrap justify-center gap-3 pb-8">
          <StudyControlLink href="/mocks" variant="surface" className={`${LINK_CLASS} min-w-[11rem]`}>
            Back to Mocks
          </StudyControlLink>
          <StudyControlLink href={listHref} variant="solid" className={`${LINK_CLASS} min-w-[11rem]`}>
            More {listLabel}
          </StudyControlLink>
        </div>
      </div>
    </div>
  );
}
