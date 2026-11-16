"use client";

import { Clock, HelpCircle, Lock, Play, RotateCcw } from "lucide-react";
import { StudyButton } from "@/components/study/study-button";
import { formatMarksPerQuestion } from "@/lib/mocks/format";
import { isStartBlocked } from "@/lib/mocks/paper-access";
import { resolvePaperCardAction } from "@/lib/mocks/paper-card-action";
import type { PaperCardData } from "@/lib/mocks/paper-card-model";

type PaperCardProps = {
  paper: PaperCardData;
  /** Start, retake or resume; the launch hook picks based on the paper. */
  onLaunch?: () => void;
  onViewPlans?: () => void;
  isActing?: boolean;
  disabled?: boolean;
};

export function PaperCard({
  paper,
  onLaunch,
  onViewPlans,
  isActing = false,
  disabled = false,
}: PaperCardProps) {
  const cardAction = resolvePaperCardAction(paper);
  const blocked = isStartBlocked(paper);

  function handlePrimary() {
    if (cardAction.kind === "view-plans") {
      onViewPlans?.();
    } else {
      onLaunch?.();
    }
  }

  return (
    <article
      aria-busy={isActing}
      className={`rounded-[14px] border border-study-divider bg-white p-4 sm:p-5 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="min-w-0 font-display text-base font-semibold text-study-ink sm:text-lg">
          {paper.title}
        </h3>
        {blocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-study-canvas px-2 py-0.5 text-[10px] font-semibold tracking-wide text-study-muted-soft uppercase">
            <Lock className="h-3 w-3" aria-hidden />
            Locked
          </span>
        ) : null}
      </div>
      {paper.subtitle ? (
        <p className="mt-1 text-sm text-study-muted-soft">{paper.subtitle}</p>
      ) : null}

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-study-muted-soft">
        <li className="inline-flex items-center gap-1">
          <HelpCircle className="h-4 w-4" aria-hidden />
          {paper.totalQuestions} questions
        </li>
        <li className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" aria-hidden />
          {paper.durationInMinutes} mins
        </li>
        <li>{formatMarksPerQuestion(paper.marksPerQuestion)}</li>
        <li>
          {paper.negativeMarking > 0
            ? `−${paper.negativeMarking} marking`
            : "No negative marking"}
        </li>
      </ul>

      <div className="mt-4">
        <StudyButton
          variant="solid"
          className="inline-flex h-11 w-full items-center justify-center rounded-[10px] px-4 text-sm font-semibold tracking-wide uppercase sm:w-auto sm:min-w-[9rem]"
          disabled={disabled || isActing}
          onClick={handlePrimary}
        >
          {cardAction.kind === "view-plans" ? (
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" aria-hidden />
              View plans
            </span>
          ) : isActing ? (
            cardAction.loadingLabel
          ) : (
            <span className="inline-flex items-center gap-2">
              {cardAction.action === "RETAKE" ? (
                <RotateCcw className="h-4 w-4" aria-hidden />
              ) : (
                <Play className="h-4 w-4" aria-hidden />
              )}
              {cardAction.label}
            </span>
          )}
        </StudyButton>
      </div>
    </article>
  );
}
