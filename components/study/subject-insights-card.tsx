import { TodaySubjectFocusIllustration } from "@/components/study/today-subject-focus-illustration";
import type { TodaySubjectInsightsSection } from "@/types/today";

type SubjectInsightsCardProps = {
  section: TodaySubjectInsightsSection;
  className?: string;
};

const DESKTOP_ASIDE_COPY =
  "Averages and chapter tips come from your chapter-wise practice in Analysis.";

const DESKTOP_PANEL_POINTS = [
  "Each bar is your subject average from chapter-wise attempts.",
  "Each tip flags a chapter to revisit — or a habit to keep when that subject is already strong.",
  "Open Analysis for the full subject and chapter breakdown.",
] as const;

export function SubjectInsightsCard({
  section,
  className = "",
}: SubjectInsightsCardProps) {
  const isEmpty = section.items.every((item) => item.averagePercent == null);

  return (
    <article
      className={`flex flex-col rounded-[20px] bg-white p-6 shadow-soft ${className}`.trim()}
    >
      <h2 className="font-display text-xl font-semibold leading-[1.35] text-study-ink">
        {section.title}
      </h2>
      {section.subhead ? (
        <p className="mt-2 text-[0.8125rem] leading-[1.4] text-study-muted-soft">
          {section.subhead}
        </p>
      ) : null}

      <div className="mt-5 flex min-h-0 flex-1 gap-6 lg:items-stretch">
        <div className="@container flex min-w-0 flex-1 flex-col">
          <ul className="divide-y divide-study-divider border-t border-study-divider">
            {section.items.map((insight) => (
              <li
                key={insight.subject}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3.5 @2xl:grid-cols-[7.5rem_minmax(5rem,auto)_minmax(0,1fr)_minmax(5rem,8rem)] @2xl:gap-4"
              >
                <span className="text-[0.9375rem] font-semibold text-study-ink">
                  {insight.subject}
                </span>
                <span className="text-[0.9375rem] tabular-nums text-study-muted-soft @2xl:text-study-ink">
                  {insight.scoreLabel}
                </span>
                {insight.tip && !isEmpty ? (
                  <span className="col-span-2 text-sm leading-[1.4] text-study-muted-soft @2xl:col-span-1 @2xl:col-start-3">
                    {insight.tip}
                  </span>
                ) : (
                  <span className="hidden @2xl:col-start-3 @2xl:block" />
                )}
                <div
                  className="col-span-2 h-2 overflow-hidden rounded-full bg-[#efe8df] @2xl:col-span-1 @2xl:col-start-4"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-study-green/70"
                    style={{
                      width: `${
                        insight.averagePercent == null
                          ? 0
                          : Math.max(0, Math.min(100, insight.averagePercent))
                      }%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-auto hidden pt-6 lg:block">
            <div className="rounded-[14px] border border-dashed border-study-divider bg-study-canvas/60 px-4 py-4">
              <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
                From chapter practice
              </p>
              <ul className="mt-2.5 space-y-2 text-[0.8125rem] leading-[1.45] text-study-muted-soft">
                {DESKTOP_PANEL_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="hidden w-[12.75rem] shrink-0 flex-col items-center justify-center gap-3 self-stretch rounded-[16px] bg-study-canvas/70 px-4 py-5 lg:flex xl:w-[14rem]">
          <TodaySubjectFocusIllustration />
          <p className="text-center text-[0.75rem] leading-[1.45] text-study-muted-soft">
            {DESKTOP_ASIDE_COPY}
          </p>
        </aside>
      </div>
    </article>
  );
}
