"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { AttemptImage } from "@/components/attempt/attempt-image";
import { MathText } from "@/components/attempt/math-text";
import {
  MathpixBoundary,
  preloadMathpix,
} from "@/components/attempt/mathpix-boundary";
import { QuestionRenderGuard } from "@/components/attempt/question-render-guard";
import { optionLabel, questionStem } from "@/lib/mocks/attempt-text";
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
  const isAttempted = Boolean(result?.selectedOption);
  const isCorrect = result?.isCorrect ?? false;
  const explanation = result?.explanation;
  const explanationText = explanation
    ? explanation[language] || explanation.en || explanation.ml
    : null;
  const statusLabel = !isAttempted
    ? "Not attempted"
    : isCorrect
      ? "Correct"
      : "Incorrect";

  return (
    <div className="border-b border-study-divider pb-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          role="img"
          aria-label={statusLabel}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
            !isAttempted
              ? "bg-study-canvas text-study-muted-soft"
              : isCorrect
                ? "bg-study-mint text-study-green"
                : "bg-study-peach text-study-peach-ink"
          }`}
        >
          {!isAttempted ? (
            <Circle className="h-5 w-5" aria-hidden />
          ) : isCorrect ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <XCircle className="h-5 w-5" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-semibold text-study-ink">
              Question {paperNumber}
            </h3>
            {question.difficultyLevel ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap capitalize ${DIFFICULTY_CLASS[question.difficultyLevel]}`}
              >
                {question.difficultyLevel}
              </span>
            ) : null}
          </div>

          <div className="text-sm text-study-ink sm:text-base">
            <MathText text={questionStem(question, language)} />
          </div>

          <ul className="space-y-2">
            {question.options.map((option) => {
              const isUserAnswer = result?.selectedOption === option.id;
              const isCorrectAnswer = result?.correctAnswer === option.id;
              return (
                <li
                  key={option.id}
                  className={`rounded-lg border p-3 ${
                    isCorrectAnswer
                      ? "border-study-green bg-study-mint"
                      : isUserAnswer
                        ? "border-study-peach-ink/50 bg-study-peach"
                        : "border-study-divider bg-white"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {isCorrectAnswer ? (
                      <>
                        <CheckCircle2
                          className="h-5 w-5 shrink-0 text-study-green"
                          aria-hidden
                        />
                        <span className="sr-only">Correct answer: </span>
                      </>
                    ) : null}
                    {isUserAnswer && !isCorrectAnswer ? (
                      <>
                        <XCircle
                          className="h-5 w-5 shrink-0 text-study-peach-ink"
                          aria-hidden
                        />
                        <span className="sr-only">Your answer: </span>
                      </>
                    ) : null}
                    {option.type === "image" && option.imageUrl ? (
                      <AttemptImage src={option.imageUrl} alt="Option" className="rounded" />
                    ) : (
                      <MathText
                        text={optionLabel(option, language)}
                        inline
                        className="text-sm text-study-ink sm:text-base"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {explanationText ? (
            <div className="rounded-lg border border-study-divider bg-study-canvas p-4">
              <h4 className="mb-2 font-display font-semibold text-study-ink">
                Explanation
              </h4>
              <div className="text-sm text-study-ink">
                <MathText text={explanationText} />
              </div>
              {explanation?.imageUrl ? (
                <AttemptImage
                  src={explanation.imageUrl}
                  alt="Explanation"
                  className="mt-3 rounded"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
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
      <div className="space-y-6">
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
                <h3 className="mb-4 rounded-lg border border-study-divider bg-study-mint px-3 py-2 text-sm font-bold break-words text-study-green">
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
          <p role="status" className="py-2 text-center text-xs text-study-muted-soft">
            Loading questions {renderCount} of {questions.length}…
          </p>
        ) : null}
      </div>
    </MathpixBoundary>
  );
}
