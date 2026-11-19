import { StudyNavLink } from "@/components/study/study-nav-link";
import { TodayGaugeIllustration } from "@/components/study/today-gauge-illustration";
import type { TodayPerspective } from "@/types/today";

type PerspectiveCardProps = {
  data: TodayPerspective;
  className?: string;
};

export function PerspectiveCard({
  data,
  className = "",
}: PerspectiveCardProps) {
  return (
    <article
      className={`rounded-[20px] bg-study-mint px-6 py-5 ${className}`.trim()}
    >
      <p className="text-[0.625rem] font-semibold leading-[1.4] text-study-green">
        {data.eyebrow}
      </p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[1.375rem] font-semibold leading-[1.3] text-study-ink">
            {data.title}
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-[1.4] text-study-muted-soft">
            {data.body}
          </p>
        </div>
        {data.locked ? <TodayGaugeIllustration /> : null}
      </div>
      {data.locked ? (
        <p className="mt-5 inline-flex rounded-full border border-dashed border-study-green/35 px-3.5 py-1.5 text-[0.75rem] font-medium text-study-muted-soft">
          {data.ctaLabel}
        </p>
      ) : (
        <StudyNavLink
          href={data.ctaHref}
          className="mt-4 inline-flex text-sm font-semibold whitespace-pre text-study-green transition-colors hover:text-study-ink"
        >
          {data.ctaLabel}
        </StudyNavLink>
      )}
    </article>
  );
}
