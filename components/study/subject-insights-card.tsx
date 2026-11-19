import type { TodaySubjectInsightsSection } from "@/types/today";

type SubjectInsightsCardProps = {
  section: TodaySubjectInsightsSection;
  className?: string;
};

export function SubjectInsightsCard({
  section,
  className = "",
}: SubjectInsightsCardProps) {
  const isEmpty = section.items.every((item) => item.averagePercent == null);

  return (
    <article
      className={`rounded-[20px] bg-white p-6 shadow-soft ${className}`.trim()}
    >
      <h2 className="font-display text-xl font-semibold leading-[1.35] text-study-ink">
        {section.title}
      </h2>
      {section.subhead ? (
        <p className="mt-2 text-[0.8125rem] leading-[1.4] text-study-muted-soft">
          {section.subhead}
        </p>
      ) : null}

      <ul className="mt-5 divide-y divide-study-divider border-t border-study-divider">
        {section.items.map((insight) => (
          <li
            key={insight.subject}
            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(4.5rem,7rem)] items-center gap-3 py-3.5 sm:grid-cols-[7.5rem_minmax(5rem,auto)_minmax(0,1fr)_minmax(5rem,8rem)] sm:gap-4"
          >
            <span className="text-[0.9375rem] font-semibold text-study-ink">
              {insight.subject}
            </span>
            <span className="text-[0.9375rem] tabular-nums text-study-muted-soft sm:text-study-ink">
              {insight.scoreLabel}
            </span>
            {insight.tip && !isEmpty ? (
              <span className="col-span-3 text-sm leading-[1.4] text-study-muted-soft sm:col-span-1 sm:col-start-3">
                {insight.tip}
              </span>
            ) : (
              <span className="hidden sm:col-start-3 sm:block" />
            )}
            <div
              className="col-start-3 h-2 overflow-hidden rounded-full bg-[#efe8df] sm:col-start-4"
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
    </article>
  );
}
