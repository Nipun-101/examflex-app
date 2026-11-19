import { StudyNavLink } from "@/components/study/study-nav-link";
import { buildScoreBars } from "@/lib/today/score-bars";
import type { TodayLatestMock } from "@/types/today";

type MockScoreCardProps = {
  data: TodayLatestMock;
};

const EMPTY_BAR_HEIGHTS = [42, 62, 82] as const;

export function MockScoreCard({ data }: MockScoreCardProps) {
  const bars = buildScoreBars(data.attempts, data.maxScore);
  const isEmpty = data.score === null;

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-soft sm:p-7">
      <h2 className="font-display text-[1.25rem] font-semibold leading-[1.35] text-study-ink sm:text-[1.4375rem]">
        {data.title}
      </h2>
      <p className="mt-2 text-[0.8125rem] leading-[1.4] whitespace-pre-wrap text-study-muted-soft">
        {data.meta}
      </p>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <div className="flex min-w-0 flex-1 flex-col">
          {isEmpty ? (
            <div className="flex items-end gap-3">
              <span
                aria-hidden
                className="mb-1.5 inline-block h-2.5 w-[4.5rem] rounded-sm bg-[#dccfc0] sm:w-[5.5rem]"
              />
              <p className="pb-0.5 text-lg leading-none text-study-muted-soft">
                / {data.maxScore}
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <p className="font-display text-5xl font-semibold leading-none tracking-tight text-study-ink sm:text-[4rem]">
                {data.score}
              </p>
              <p className="pb-1 text-lg leading-[1.4] text-study-muted-soft">
                / {data.maxScore}
              </p>
            </div>
          )}

          {data.deltaLabel ? (
            <p className="mt-5 inline-flex h-10 items-center rounded-[9px] bg-study-mint px-4 text-sm font-medium text-study-green">
              {data.deltaLabel}
            </p>
          ) : null}

          {data.placeholderMessage ? (
            <p className="mt-5 inline-flex max-w-[15rem] rounded-full border border-dashed border-study-divider px-3.5 py-2 text-[0.8125rem] leading-[1.4] text-study-muted-soft">
              {data.placeholderMessage}
            </p>
          ) : null}

          {data.breakdown ? (
            <p className="mt-5 text-xs leading-[1.4] whitespace-pre-wrap text-study-muted-soft">
              {data.breakdown}
            </p>
          ) : isEmpty ? (
            <p className="mt-4 text-xs leading-[1.4] text-study-muted-soft">
              <span className="inline-block w-3 border-t border-study-muted-soft/70 align-middle" />{" "}
              correct ·{" "}
              <span className="inline-block w-3 border-t border-study-muted-soft/70 align-middle" />{" "}
              incorrect ·{" "}
              <span className="inline-block w-3 border-t border-study-muted-soft/70 align-middle" />{" "}
              skipped
            </p>
          ) : null}

          <StudyNavLink
            href="/mocks"
            className="mt-6 inline-flex self-start text-[0.8125rem] font-semibold text-study-green transition-colors hover:text-study-ink"
          >
            Open mocks →
          </StudyNavLink>
        </div>

        <div
          className="hidden w-px shrink-0 bg-study-divider lg:block"
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-semibold tracking-wide text-study-muted-soft uppercase">
            YOUR LAST 3 ATTEMPTS
          </p>
          <ul className="mt-4 flex h-[9.5rem] items-end justify-between gap-4 sm:gap-6">
            {bars.map((bar, index) => {
              const emptyHeight =
                EMPTY_BAR_HEIGHTS[Math.min(index, EMPTY_BAR_HEIGHTS.length - 1)] ??
                50;

              return (
                <li
                  key={bar.id}
                  className="flex h-full min-w-0 flex-1 flex-col items-center"
                >
                  {!bar.isEmpty ? (
                    <span className="mb-2 text-[0.9375rem] font-semibold text-study-ink">
                      {bar.score}
                    </span>
                  ) : null}
                  <div
                    className="mt-auto flex min-h-0 w-full flex-1 items-end justify-center"
                    role="img"
                    aria-label={
                      bar.isEmpty
                        ? `${bar.label}: no score yet`
                        : `${bar.label}: ${bar.score} of ${data.maxScore}`
                    }
                  >
                    {bar.isEmpty ? (
                      <div
                        className="w-full max-w-[5.3125rem] rounded-lg border border-dashed border-study-divider bg-[#f7f3ec]"
                        style={{ height: `${emptyHeight}%` }}
                      />
                    ) : (
                      <div
                        className={`w-full max-w-[5.3125rem] rounded-lg ${
                          bar.isLatest ? "bg-study-green" : "bg-study-mint-bar"
                        }`}
                        style={{ height: `${bar.heightPercent}%` }}
                      />
                    )}
                  </div>
                  <span className="mt-2 text-center text-xs text-study-muted-soft">
                    {bar.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
}
