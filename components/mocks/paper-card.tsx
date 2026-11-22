"use client";

import { createElement } from "react";
import { StudyNavLink } from "@/components/study/study-nav-link";
import { Check, Lock, Play } from "lucide-react";
import { StudyButton, StudyControlLink } from "@/components/study/study-button";
import { isStartBlocked } from "@/lib/mocks/paper-access";
import {
  resolvePaperCardAction,
  resolvePaperCardReviewAction,
} from "@/lib/mocks/paper-card-action";
import { formatPaperCardClock } from "@/lib/mocks/paper-card-format";
import type { PaperCardData } from "@/lib/mocks/paper-card-model";
import {
  paperSubjectTheme,
  resolvePaperCardIcon,
} from "@/lib/mocks/paper-subject-theme";
import { scorePercentage } from "@/lib/mocks/performance-bands";

type PaperCardProps = {
  paper: PaperCardData;
  /** Start, retry or resume; the launch hook picks based on the paper. */
  onLaunch?: () => void;
  onViewPlans?: () => void;
  isActing?: boolean;
  disabled?: boolean;
};

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in srgb, var(--study-ink) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--study-ink) 12%, transparent) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
} as const;

const CTA_CLASS =
  "inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-sm font-bold tracking-[0.08em] uppercase";

function StatusBadge({ status }: { status: PaperCardData["status"] }) {
  if (status === "in_progress") {
    return (
      <span className="rounded-full bg-study-peach px-3 py-1 text-[10px] font-bold tracking-[0.08em] text-study-peach-ink uppercase">
        In progress
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-study-green px-3 py-1 text-[10px] font-bold tracking-[0.08em] text-white uppercase">
        Completed
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  return (
    <span className="rounded-full bg-study-lime px-3 py-1 text-[10px] font-bold tracking-[0.08em] text-study-ink uppercase">
      New
    </span>
  );
}

function StatsStrip({ paper }: { paper: PaperCardData }) {
  const cells = [
    { value: String(paper.totalQuestions), label: "Questions" },
    { value: `${paper.durationInMinutes} min`, label: "Time" },
    { value: String(paper.totalMarks), label: "Marks" },
  ] as const;

  return (
    <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-[14px] border border-study-divider">
      {cells.map((cell, index) => (
        <div
          key={cell.label}
          className={`px-2 py-3 text-center ${
            index > 0 ? "border-l border-study-divider" : ""
          }`}
        >
          <dd className="font-display text-lg font-bold tracking-tight text-study-ink sm:text-xl">
            {cell.value}
          </dd>
          <dt className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-study-muted-soft uppercase">
            {cell.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function ProgressBlock({ paper }: { paper: PaperCardData }) {
  const answered = paper.answeredCount ?? 0;
  const total = Math.max(paper.totalQuestions, 1);
  const ratio = Math.min(1, answered / total);
  const remaining = paper.timeRemainingSeconds ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm text-study-muted-soft">
        <span>
          {answered} of {paper.totalQuestions} answered
        </span>
        <span className="tabular-nums">
          {formatPaperCardClock(remaining)} left
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-study-mint-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={paper.totalQuestions}
        aria-valuenow={answered}
        aria-label="Questions answered"
      >
        <div
          className="h-full rounded-full bg-study-green"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Marks can be fractional (negative marking); trim float noise. */
function formatMarks(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function PaperScoreRing({
  correct,
  total,
  marks,
  totalMarks,
}: {
  correct: number;
  total: number;
  /** Best marks obtained; the ring itself still tracks correct/total. */
  marks?: number | undefined;
  totalMarks: number;
}) {
  const showMarks = marks !== undefined && Number.isFinite(marks);
  const label = showMarks
    ? `${formatMarks(marks)}/${formatMarks(totalMarks)}`
    : `${correct}/${total}`;
  const percentage = scorePercentage(correct, total);
  const dashOffset = RING_CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div
      role="img"
      aria-label={`Best score ${label.replace("/", " out of ")}${showMarks ? " marks" : ""}`}
      className="relative size-[6.5rem] shrink-0"
    >
      <svg className="size-full" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--study-mint-bar)"
          strokeWidth="9"
        />
        {percentage > 0 ? (
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--study-green)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-sm font-bold tabular-nums text-study-ink">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Best-score strip from finished attempts (also shown under an active retake). */
function BestScoreBlock({ paper }: { paper: PaperCardData }) {
  const correct = paper.bestCorrectAnswers ?? 0;
  const attempts = paper.attemptCount;
  const duration =
    paper.lastTimeTakenSeconds !== undefined
      ? formatPaperCardClock(paper.lastTimeTakenSeconds)
      : null;

  return (
    <div className="flex items-center gap-3.5">
      <PaperScoreRing
        correct={correct}
        total={paper.totalQuestions}
        marks={paper.bestScore}
        totalMarks={paper.totalMarks}
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-bold text-study-ink">
          Best score · {attempts}{" "}
          {attempts === 1 ? "attempt" : "attempts"}
        </p>
        {duration ? (
          <p className="text-sm text-study-muted-soft">
            {duration} taken last time
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CompletedBlock({ paper }: { paper: PaperCardData }) {
  const mistakes =
    paper.mistakeBookRemaining ?? paper.lastIncorrectAnswers ?? 0;

  return (
    <div className="mt-4 space-y-3">
      <BestScoreBlock paper={paper} />
      {mistakes > 0 ? (
        <StudyNavLink
          href={`/mistake-book/${paper.id}`}
          className="flex min-h-11 items-center rounded-full bg-study-lilac px-4 py-2.5 text-sm font-medium text-study-ink transition-colors hover:brightness-95"
        >
          {mistakes} {mistakes === 1 ? "mistake" : "mistakes"} waiting in your
          Mistake Book
        </StudyNavLink>
      ) : null}
    </div>
  );
}

function hasFinishedAttemptHistory(paper: PaperCardData): boolean {
  return paper.attemptCount > 0;
}

export function PaperCard({
  paper,
  onLaunch,
  onViewPlans,
  isActing = false,
  disabled = false,
}: PaperCardProps) {
  const cardAction = resolvePaperCardAction(paper);
  const reviewAction = resolvePaperCardReviewAction(paper);
  const blocked = isStartBlocked(paper);
  const theme = paperSubjectTheme(paper.subjectName);
  const icon = resolvePaperCardIcon({
    kind: paper.kind,
    subjectName: paper.subjectName,
    topicName: paper.topicName,
  });
  const showRetry =
    paper.status === "completed" &&
    paper.allowRetake !== false &&
    cardAction.kind === "attempt";
  const showReviewOnly =
    paper.status === "completed" &&
    paper.allowRetake === false &&
    reviewAction !== null;

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
      className={`overflow-hidden rounded-[22px] border border-study-divider bg-white shadow-[var(--shadow-soft)] ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className={`relative h-[4.75rem] overflow-hidden ${theme.bandClass}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={GRID_STYLE}
        />
        <div className="relative flex h-full items-start justify-end px-4 pt-3.5 sm:px-5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {blocked && paper.status !== "in_progress" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-study-muted-soft uppercase">
                <Lock className="h-3 w-3" aria-hidden />
                Locked
              </span>
            ) : null}
            <StatusBadge status={paper.status} />
          </div>
        </div>
      </div>

      <div className="relative px-4 pt-0 pb-5 sm:px-5 sm:pb-6">
        <span className="absolute -top-7 left-4 grid size-14 place-items-center rounded-[16px] border border-study-divider bg-white text-study-ink shadow-[var(--shadow-soft)] sm:left-5">
          {createElement(icon, {
            className: "h-6 w-6",
            strokeWidth: 1.75,
            "aria-hidden": true,
          })}
        </span>

        <div className="pt-9">
          <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-study-muted-soft uppercase">
            {paper.eyebrow}
          </p>
          <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight text-study-ink sm:text-2xl">
            {paper.title}
          </h3>

          <StatsStrip paper={paper} />

          {paper.negativeMarking === 0 ? (
            <p className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-medium text-study-green">
              <Check className="h-4 w-4" strokeWidth={2.75} aria-hidden />
              No negative marking
            </p>
          ) : (
            <p className="mt-3.5 text-sm font-medium text-study-muted-soft">
              −{paper.negativeMarking} marking
            </p>
          )}

          {paper.status === "in_progress" ? (
            <div className="mt-4 space-y-3">
              {hasFinishedAttemptHistory(paper) ? (
                <BestScoreBlock paper={paper} />
              ) : null}
              <ProgressBlock paper={paper} />
            </div>
          ) : null}
          {paper.status === "completed" ? (
            <CompletedBlock paper={paper} />
          ) : null}

          <div className="mt-5 flex flex-col gap-2.5">
            <div className="flex flex-col gap-2.5 sm:flex-row">
            {cardAction.kind === "view-plans" ? (
              <StudyButton
                variant="solid"
                className={CTA_CLASS}
                disabled={disabled || isActing}
                onClick={handlePrimary}
              >
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" aria-hidden />
                  View plans
                </span>
              </StudyButton>
            ) : showReviewOnly && reviewAction ? (
              <StudyControlLink
                href={reviewAction.href}
                variant="solid"
                className={CTA_CLASS}
              >
                {reviewAction.label}
              </StudyControlLink>
            ) : paper.status === "completed" ? (
              <>
                {showRetry ? (
                  <StudyButton
                    variant="outline"
                    className={CTA_CLASS}
                    disabled={disabled || isActing}
                    onClick={handlePrimary}
                  >
                    {isActing ? cardAction.loadingLabel : cardAction.label}
                  </StudyButton>
                ) : null}
                {reviewAction ? (
                  <StudyControlLink
                    href={reviewAction.href}
                    variant="solid"
                    className={CTA_CLASS}
                  >
                    {reviewAction.label}
                  </StudyControlLink>
                ) : null}
              </>
            ) : paper.status === "in_progress" ? (
              <>
                <StudyButton
                  variant="solid"
                  className={CTA_CLASS}
                  disabled={disabled || isActing}
                  onClick={handlePrimary}
                >
                  {isActing ? cardAction.loadingLabel : cardAction.label}
                </StudyButton>
                {reviewAction ? (
                  <StudyControlLink
                    href={reviewAction.href}
                    variant="outline"
                    className={CTA_CLASS}
                  >
                    {reviewAction.label}
                  </StudyControlLink>
                ) : null}
              </>
            ) : (
              <StudyButton
                variant="solid"
                className={CTA_CLASS}
                disabled={disabled || isActing}
                onClick={handlePrimary}
              >
                {isActing ? (
                  cardAction.loadingLabel
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Play className="h-4 w-4 fill-current" aria-hidden />
                    {cardAction.label}
                  </span>
                )}
              </StudyButton>
            )}
            </div>
            {reviewAction ? (
              <p className="text-center text-xs text-study-muted-soft sm:text-left">
                Review opens your latest attempt
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
