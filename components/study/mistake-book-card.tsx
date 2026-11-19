import { StudyNavLink } from "@/components/study/study-nav-link";
import { TodayMistakeIllustration } from "@/components/study/today-mistake-illustration";
import type { TodayMistakeBook } from "@/types/today";

type MistakeBookCardProps = {
  data: TodayMistakeBook;
};

export function MistakeBookCard({ data }: MistakeBookCardProps) {
  return (
    <article className="rounded-[20px] bg-study-peach px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-semibold leading-[1.4] text-study-peach-ink">
            {data.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-[1.5625rem] font-semibold leading-[1.3] text-study-ink">
            {data.title}
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-[1.4] text-study-muted-soft">
            {data.body}
          </p>
        </div>
        <TodayMistakeIllustration />
      </div>

      <div className="mt-5 flex flex-col items-start gap-4">
        {data.statusPill ? (
          <p className="inline-flex max-w-full rounded-full border border-dashed border-study-peach-ink/30 px-3.5 py-1.5 text-[0.75rem] leading-[1.4] text-study-muted-soft">
            {data.statusPill}
          </p>
        ) : null}

        <StudyNavLink
          href={data.ctaHref}
          className="ml-1 inline-flex text-sm font-semibold whitespace-pre text-study-peach-ink transition-colors hover:text-study-ink"
        >
          {data.ctaLabel}
        </StudyNavLink>
      </div>
    </article>
  );
}
