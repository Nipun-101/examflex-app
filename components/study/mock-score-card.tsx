import { buildScoreBars } from "@/lib/today/score-bars";
import type { TodayLatestMock } from "@/types/today";

type MockScoreCardProps = {
  data: TodayLatestMock;
};

export function MockScoreCard({ data }: MockScoreCardProps) {
  const bars = buildScoreBars(data.attempts, data.maxScore);

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-soft sm:p-7">
      <h2 className="font-display text-[1.25rem] font-semibold leading-[1.35] text-study-ink sm:text-[1.4375rem]">
        {data.title}
      </h2>
      <p className="mt-2 text-[0.8125rem] leading-[1.4] whitespace-pre-wrap text-study-muted-soft">
        {data.meta}
      </p>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-end gap-2">
            <p className="font-display text-5xl font-semibold leading-none tracking-tight text-study-ink sm:text-[4rem]">
              {data.score}
            </p>
            <p className="pb-1 text-lg leading-[1.4] text-study-muted-soft">
              / {data.maxScore}
            </p>
          </div>

          <p className="mt-5 inline-flex h-10 items-center rounded-[9px] bg-study-mint px-4 text-sm font-medium text-study-green">
            {data.deltaLabel}
          </p>

          <p className="mt-5 text-xs leading-[1.4] whitespace-pre-wrap text-study-muted-soft">
            {data.breakdown}
          </p>
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
            {bars.map((bar) => (
              <li
                key={bar.id}
                className="flex h-full min-w-0 flex-1 flex-col items-stretch"
              >
                <span className="mb-2 text-[0.9375rem] font-semibold text-study-ink">
                  {bar.score}
                </span>
                <div
                  className="mt-auto flex min-h-0 flex-1 items-end"
                  role="img"
                  aria-label={`${bar.label}: ${bar.score} of ${data.maxScore}`}
                >
                  <div
                    className={`w-full max-w-[5.3125rem] rounded-lg ${
                      bar.isLatest ? "bg-study-green" : "bg-study-mint-bar"
                    }`}
                    style={{ height: `${bar.heightPercent}%` }}
                  />
                </div>
                <span className="mt-2 text-xs text-study-muted-soft">
                  {bar.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
