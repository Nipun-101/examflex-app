"use client";

import { AttemptImage } from "@/components/attempt/attempt-image";
import { MathText } from "@/components/attempt/math-text";
import { questionZoomStyle } from "@/lib/mocks/question-zoom";
import {
  optionLabel,
  questionImageUrl,
  questionStem,
} from "@/lib/mocks/attempt-text";
import type { AttemptLanguage, AttemptQuestion } from "@/types/attempt";

type QuestionPanelProps = {
  question: AttemptQuestion;
  /** 1-based number shown in the heading. */
  number: number;
  language: AttemptLanguage;
  zoomIndex: number;
  selectedOptionId: string | undefined;
  onSelectOption: (optionId: string) => void;
};

export function QuestionPanel({
  question,
  number,
  language,
  zoomIndex,
  selectedOptionId,
  onSelectOption,
}: QuestionPanelProps) {
  const imageUrl = questionImageUrl(question, language);
  const headingId = `question-heading-${question._id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-[16px] border border-study-divider bg-white p-4 sm:p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-5"
    >
      <h2
        id={headingId}
        className="border-b border-study-divider pb-3 font-display text-base font-semibold text-study-ink sm:text-lg"
      >
        Question No {number}
      </h2>

      {/* Font-size zoom only: keeps MathJax SVG sharp (CSS `zoom` rasterizes it). */}
      <div
        className="question-zoom mt-4 min-w-0 space-y-4 break-words [overflow-wrap:anywhere]"
        style={questionZoomStyle(zoomIndex)}
        data-testid="question-zoom"
      >
        <div className="question-zoom-copy leading-relaxed text-study-ink">
          <MathText text={questionStem(question, language)} />
          {imageUrl ? (
            <AttemptImage src={imageUrl} alt="Question" className="mt-3" />
          ) : null}
        </div>

        <div role="radiogroup" aria-labelledby={headingId} className="grid gap-2.5">
          {question.options.map((option) => {
            const selected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelectOption(option.id)}
                className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[12px] border-2 px-3 py-2.5 text-left transition-colors sm:px-4 ${
                  selected
                    ? "border-[#2f5ea8] bg-[#e7eef8]"
                    : "border-study-divider bg-white hover:border-[#2f5ea8]/40 hover:bg-study-canvas"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                    selected
                      ? "border-[#2f5ea8] bg-[#2f5ea8]"
                      : "border-study-muted"
                  }`}
                >
                  {selected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                {option.type === "image" && option.imageUrl ? (
                  <AttemptImage
                    src={option.imageUrl}
                    alt={`Option ${option.id}`}
                    className="min-w-0 rounded"
                  />
                ) : (
                  <MathText
                    text={optionLabel(option, language)}
                    inline
                    className="question-zoom-copy min-w-0 flex-1 leading-relaxed text-study-ink [&_#preview]:!block [&_#preview]:!p-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
