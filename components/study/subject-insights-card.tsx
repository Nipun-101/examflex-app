import type { TodaySubjectInsight } from "@/types/today";

type SubjectInsightsCardProps = {
  title: string;
  insights: readonly TodaySubjectInsight[];
  className?: string;
};

export function SubjectInsightsCard({
  title,
  insights,
  className = "",
}: SubjectInsightsCardProps) {
  return (
    <article
      className={`rounded-[20px] bg-white p-6 shadow-soft ${className}`.trim()}
    >
      <h2 className="font-display text-xl font-semibold leading-[1.35] text-study-ink">
        {title}
      </h2>
      <ul className="mt-5 space-y-4">
        {insights.map((insight) => (
          <li
            key={insight.subject}
            className="grid gap-1 sm:grid-cols-[7.5rem_6.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-4"
          >
            <span className="text-[0.9375rem] font-semibold text-study-ink">
              {insight.subject}
            </span>
            <span className="text-[0.9375rem] text-study-ink">
              {insight.scoreLabel}
            </span>
            <span className="text-sm leading-[1.4] text-study-muted-soft">
              {insight.tip}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
