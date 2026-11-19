import { StudyNavLink } from "@/components/study/study-nav-link";
import { buildScoreBars } from "@/lib/today/score-bars";
import type { AnalysisFullMocksSection } from "@/types/analysis";
import { examHubPath } from "@/lib/mocks/exam-test-routes";

type AnalysisHistoryCardProps = {
  examId: string;
  fullMocks: AnalysisFullMocksSection;
  locked?: boolean;
};

const PLACEHOLDER_ATTEMPTS = [
  { id: "p1", label: "Mock 1", score: 420 },
  { id: "p2", label: "Mock 2", score: 480 },
  { id: "p3", label: "Mock 3", score: 510 },
  { id: "p4", label: "Mock 4", score: 535 },
  { id: "p5", label: "Mock 5", score: 560 },
] as const;

export function AnalysisHistoryCard({
  examId,
  fullMocks,
  locked = false,
}: AnalysisHistoryCardProps) {
  const latest = fullMocks.latest;
  const maxScore =
    latest?.maxScore ??
    fullMocks.recent[fullMocks.recent.length - 1]?.maxScore ??
    720;

  const mocksHref =
    examId === "illustrative"
      ? "/mocks"
      : `${examHubPath(examId)}/full-mocks`;

  const attempts = locked
    ? [...PLACEHOLDER_ATTEMPTS]
    : fullMocks.recent.map((item) => ({
        id: item.attemptId,
        label: item.label,
        score: item.score,
      }));
  const bars = buildScoreBars(attempts, maxScore);

  const deltaLabel =
    latest?.deltaFromPrevious === null ||
    latest?.deltaFromPrevious === undefined
      ? "First full mock in view"
      : latest.deltaFromPrevious >= 0
        ? `+${latest.deltaFromPrevious} from previous`
        : `${latest.deltaFromPrevious} from previous`;

  const breakdown =
    latest?.correctCount !== undefined
      ? `${latest.correctCount} correct  ·  ${latest.incorrectCount ?? 0} incorrect  ·  ${latest.skippedCount ?? 0} skipped`
      : "Full-mock form over your recent attempts";

  return (
    <article
      className={`relative overflow-hidden rounded-[20px] bg-white p-6 shadow-soft sm:p-7 ${
        locked ? "min-h-[22rem] sm:min-h-[24rem]" : ""
      }`}
    >
      {locked ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 px-5 backdrop-blur-[1.5px]">
          <div className="max-w-sm rounded-[16px] border border-study-divider/80 bg-white/90 px-5 py-5 text-center shadow-soft">
            <h2 className="font-display text-base font-semibold text-study-ink sm:text-lg">
              Unlock your full-mock trend
            </h2>
            <p className="mt-2 text-sm leading-[1.45] text-study-muted-soft">
              Finish {fullMocks.targetCount} full mocks for this exam to see
              your last scores side by side — and how each attempt moved the
              needle.
            </p>
            <StudyNavLink
              href={mocksHref}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-[10px] bg-study-green px-5 text-sm font-semibold text-white transition-colors hover:bg-study-ink"
            >
              Attempt a full mock
            </StudyNavLink>
          </div>
        </div>
      ) : null}

      <div className={locked ? "select-none" : undefined} aria-hidden={locked}>
        <p className="font-display text-[1.25rem] font-semibold leading-[1.35] text-study-ink sm:text-[1.4375rem]">
          A score is a starting point.
        </p>
        <p className="mt-2 text-[0.8125rem] leading-[1.4] text-study-muted-soft">
          {locked
            ? `Your last ${fullMocks.targetCount} full mocks will live here`
            : fullMocks.needsMoreAttempts
              ? `${fullMocks.completedCount} of ${fullMocks.targetCount} full mocks done · keep going`
              : `Last ${fullMocks.recent.length} full mocks`}
        </p>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-end gap-2">
              <p className="font-display text-5xl font-semibold leading-none tracking-tight text-study-ink sm:text-[4rem]">
                {locked || latest == null ? "—" : latest.score}
              </p>
              <p className="pb-1 text-lg leading-[1.4] text-study-muted-soft">
                / {maxScore}
              </p>
            </div>

            <p className="mt-5 inline-flex h-10 items-center rounded-[9px] bg-study-mint px-4 text-sm font-medium text-study-green">
              {locked ? "Waiting for your first full mock" : deltaLabel}
            </p>

            <p className="mt-5 text-xs leading-[1.4] text-study-muted-soft">
              {locked
                ? "Correct, incorrect, and skipped counts appear after you submit"
                : breakdown}
            </p>
            {!locked ? (
              <StudyNavLink
                href={mocksHref}
                className="mt-5 inline-flex text-[0.8125rem] font-semibold text-study-green transition-colors hover:text-study-ink"
              >
                Open full mocks →
              </StudyNavLink>
            ) : null}
          </div>

          <div
            className="hidden w-px shrink-0 bg-study-divider lg:block"
            aria-hidden
          />

          <div className="min-w-0 flex-1">
            <p className="text-[0.625rem] font-semibold tracking-wide text-study-muted-soft uppercase">
              Your last {fullMocks.targetCount} attempts
            </p>
            <ul className="mt-4 flex h-[9.5rem] items-end justify-between gap-3 sm:gap-4">
              {bars.map((bar) => (
                <li
                  key={bar.id}
                  className="flex h-full min-w-0 flex-1 flex-col items-stretch"
                >
                  <span className="mb-2 text-[0.8125rem] font-semibold text-study-ink sm:text-[0.9375rem]">
                    {locked ? "—" : bar.score}
                  </span>
                  <div
                    className="mt-auto flex min-h-0 flex-1 items-end"
                    role="img"
                    aria-label={
                      locked
                        ? `${bar.label}: locked`
                        : `${bar.label}: ${bar.score} of ${maxScore}`
                    }
                  >
                    <div
                      className={`w-full max-w-[4.5rem] rounded-lg ${
                        locked
                          ? "bg-study-mint-bar/70"
                          : bar.isLatest
                            ? "bg-study-green"
                            : "bg-study-mint-bar"
                      }`}
                      style={{
                        height: locked ? "55%" : `${bar.heightPercent}%`,
                      }}
                    />
                  </div>
                  <span className="mt-2 text-[0.625rem] text-study-muted-soft sm:text-xs">
                    {bar.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
