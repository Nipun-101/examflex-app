"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, ChevronDown, Minus, X, XCircle } from "lucide-react";
import { AttemptImage } from "@/components/attempt/attempt-image";
import { MathText } from "@/components/attempt/math-text";
import {
  MathpixBoundary,
  preloadMathpix,
} from "@/components/attempt/mathpix-boundary";
import { QuestionRenderGuard } from "@/components/attempt/question-render-guard";
import { answerKeyQuestionDomId } from "@/components/attempt/results-question-map";
import { optionLabel, questionStem } from "@/lib/mocks/attempt-text";
import { optionLetter, resultOutcome } from "@/lib/mocks/result-outcome";
import type {
  AttemptDifficulty,
  AttemptLanguage,
  AttemptQuestion,
  SubmittedQuestionResult,
} from "@/types/attempt";

/** Render the key in slices so a 180-question paper does not freeze the page. */
const BATCH_SIZE = 8;

type AnswerKeyListProps = {
  questions: readonly AttemptQuestion[];
  resultsByQuestion: ReadonlyMap<string, SubmittedQuestionResult>;
  /** Question id → 0-based position in the whole paper. */
  paperIndexById: ReadonlyMap<string, number>;
  sectionByQuestionId: ReadonlyMap<string, string>;
  showSectionHeadings: boolean;
  language: AttemptLanguage;
};

const DIFFICULTY_CLASS: Record<AttemptDifficulty, string> = {
  easy: "bg-study-mint text-study-green",
  medium: "bg-study-lime text-study-ink",
  hard: "bg-study-peach text-study-peach-ink",
};

const STATUS_LABEL = {
  correct: "Correct",
  wrong: "Wrong",
  skipped: "Not attempted",
} as const;

function AnswerKeyItem({
  question,
  result,
  paperNumber,
  language,
}: {
  question: AttemptQuestion;
  result: SubmittedQuestionResult | undefined;
  paperNumber: number;
  language: AttemptLanguage;
}) {
  const outcome = resultOutcome(result);
  const [expanded, setExpanded] = useState(outcome === "wrong");
  const explanation = result?.explanation;
  const explanationText = explanation
    ? explanation[language] || explanation.en || explanation.ml
    : null;
  const explanationImages = explanation
    ? [
        ...(explanation.imageUrl ? [explanation.imageUrl] : []),
        ...(explanation.imageUrls ?? []),
      ].filter((url, index, all) => all.indexOf(url) === index)
    : [];
  const hasExplanation =
    Boolean(explanationText && explanationText.trim()) ||
    explanationImages.length > 0;

  const correctOption = question.options.find(
    (option) => option.id === result?.correctAnswer
  );
  const selectedOption = question.options.find(
    (option) => option.id === result?.selectedOption
  );
  const correctIndex = question.options.findIndex(
    (option) => option.id === result?.correctAnswer
  );
  const selectedIndex = question.options.findIndex(
    (option) => option.id === result?.selectedOption
  );

  return (
    <article
      id={answerKeyQuestionDomId(paperNumber)}
      className="scroll-mt-24 rounded-[20px] border border-study-divider bg-white p-4 shadow-soft sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            role="img"
            aria-label={STATUS_LABEL[outcome]}
            className={`grid size-8 shrink-0 place-items-center rounded-full ${
              outcome === "skipped"
                ? "bg-study-canvas text-study-muted-soft"
                : outcome === "correct"
                  ? "bg-study-mint text-study-green"
                  : "bg-study-peach text-study-peach-ink"
            }`}
          >
            {outcome === "skipped" ? (
              <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            ) : outcome === "correct" ? (
              <Check className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            ) : (
              <X className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            )}
          </span>
          <h3 className="font-display text-base font-bold text-study-ink">
            Question {paperNumber}
          </h3>
        </div>
        {question.difficultyLevel ? (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap capitalize ${DIFFICULTY_CLASS[question.difficultyLevel]}`}
          >
            {question.difficultyLevel}
          </span>
        ) : null}
      </div>

      <div className="mt-3 text-sm font-medium text-study-ink sm:text-[0.9375rem]">
        <MathText text={questionStem(question, language)} />
      </div>

      {!expanded ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-study-divider bg-study-canvas/80 px-3 py-2.5">
          <div className="min-w-0 text-sm text-study-ink">
            {outcome === "skipped" ? (
              <>
                Not attempted
                {correctOption ? (
                  <>
                    {" · "}
                    Correct answer:{" "}
                    <span className="inline-flex min-w-0 items-baseline font-semibold">
                      {correctOption.type === "image" ? (
                        `(${optionLetter(Math.max(0, correctIndex))})`
                      ) : (
                        <MathText
                          text={optionLabel(correctOption, language)}
                          inline
                        />
                      )}
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              <>
                You chose{" "}
                <span className="inline-flex min-w-0 items-baseline gap-1 font-semibold">
                  {selectedOption ? (
                    selectedOption.type === "image" ? (
                      `(${optionLetter(Math.max(0, selectedIndex))})`
                    ) : (
                      <>
                        {`(${optionLetter(Math.max(0, selectedIndex))}) `}
                        <MathText
                          text={optionLabel(selectedOption, language)}
                          inline
                        />
                      </>
                    )
                  ) : (
                    "—"
                  )}
                </span>{" "}
                <Check
                  className="inline h-3.5 w-3.5 text-study-green"
                  strokeWidth={3}
                  aria-hidden
                />
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 text-sm font-semibold text-study-green transition-colors hover:bg-study-mint hover:text-study-ink"
          >
            Show options
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {outcome !== "wrong" ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-2 text-sm font-semibold text-study-green transition-colors hover:bg-study-mint hover:text-study-ink"
              >
                Hide options
                <ChevronDown className="h-4 w-4 rotate-180" aria-hidden />
              </button>
            </div>
          ) : null}

          <ul className="space-y-2">
            {question.options.map((option, index) => {
              const isUserAnswer = result?.selectedOption === option.id;
              const isCorrectAnswer = result?.correctAnswer === option.id;
              const letter = optionLetter(index);

              return (
                <li
                  key={option.id}
                  className={`relative rounded-[14px] border px-3 py-3 ${
                    isCorrectAnswer
                      ? "border-study-green/40 bg-study-mint"
                      : isUserAnswer
                        ? "border-study-peach-ink/35 bg-study-peach"
                        : "border-study-divider bg-white"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      aria-hidden
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        isCorrectAnswer
                          ? "bg-study-green text-white"
                          : isUserAnswer
                            ? "bg-study-peach-ink text-white"
                            : "border border-study-divider bg-white text-study-muted-soft"
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      {isCorrectAnswer ? (
                        <span className="sr-only">Correct answer: </span>
                      ) : null}
                      {isUserAnswer && !isCorrectAnswer ? (
                        <span className="sr-only">Your answer: </span>
                      ) : null}
                      {option.type === "image" && option.imageUrl ? (
                        <AttemptImage
                          src={option.imageUrl}
                          alt="Option"
                          className="rounded"
                        />
                      ) : (
                        <MathText
                          text={optionLabel(option, language)}
                          inline
                          className="text-sm text-study-ink sm:text-base"
                        />
                      )}
                    </div>
                    {isCorrectAnswer ? (
                      <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-xs font-semibold text-study-green">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Correct answer
                      </span>
                    ) : null}
                  </div>
                  {isUserAnswer && !isCorrectAnswer ? (
                    <p className="mt-2 flex items-center justify-end gap-1 text-xs font-semibold text-study-peach-ink">
                      <XCircle className="h-3.5 w-3.5" aria-hidden />
                      Your answer
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasExplanation ? (
        <div className="mt-4 rounded-[14px] border border-study-divider bg-study-canvas p-4">
          <h4 className="mb-2 font-display text-sm font-bold text-study-ink">
            Explanation
          </h4>
          {explanationText ? (
            <div className="text-sm text-study-ink">
              <MathText text={explanationText} />
            </div>
          ) : null}
          {explanationImages.map((src) => (
            <AttemptImage
              key={src}
              src={src}
              alt="Explanation"
              className={explanationText ? "mt-3 rounded" : "rounded"}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function AnswerKeyList({
  questions,
  resultsByQuestion,
  paperIndexById,
  sectionByQuestionId,
  showSectionHeadings,
  language,
}: AnswerKeyListProps) {
  // Reset the slice when the filtered list changes by remembering which list
  // the count belongs to (state-during-render, not an effect).
  const [renderState, setRenderState] = useState(() => ({
    list: questions,
    count: Math.min(BATCH_SIZE, questions.length),
  }));
  let renderCount = renderState.count;
  if (renderState.list !== questions) {
    renderCount = Math.min(BATCH_SIZE, questions.length);
    setRenderState({ list: questions, count: renderCount });
  }

  useEffect(() => {
    preloadMathpix();
  }, []);

  useEffect(() => {
    if (renderCount >= questions.length) return;
    const id = window.setTimeout(() => {
      setRenderState((prev) => ({
        ...prev,
        count: Math.min(prev.count + BATCH_SIZE, questions.length),
      }));
    }, 40);
    return () => window.clearTimeout(id);
  }, [renderCount, questions.length]);

  if (questions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-study-muted-soft">
        Answer key questions could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  const visible = questions.slice(0, renderCount);

  return (
    <MathpixBoundary>
      <div className="space-y-4">
        {visible.map((question, visibleIndex) => {
          const sectionName = sectionByQuestionId.get(question._id);
          const previous = visible[visibleIndex - 1];
          const previousSection = previous
            ? sectionByQuestionId.get(previous._id)
            : undefined;
          const showHeading =
            showSectionHeadings &&
            sectionName !== undefined &&
            sectionName !== previousSection;

          return (
            <div key={question._id}>
              {showHeading ? (
                <h3 className="mb-3 rounded-[12px] border border-study-divider bg-study-mint px-3 py-2 text-sm font-bold break-words text-study-green">
                  {sectionName}
                </h3>
              ) : null}
              <QuestionRenderGuard>
                <AnswerKeyItem
                  question={question}
                  result={resultsByQuestion.get(question._id)}
                  paperNumber={(paperIndexById.get(question._id) ?? 0) + 1}
                  language={language}
                />
              </QuestionRenderGuard>
            </div>
          );
        })}
        {renderCount < questions.length ? (
          <p
            role="status"
            className="py-2 text-center text-xs text-study-muted-soft"
          >
            Showing {renderCount} of {questions.length} questions — scroll for
            the rest
          </p>
        ) : null}
      </div>
    </MathpixBoundary>
  );
}
