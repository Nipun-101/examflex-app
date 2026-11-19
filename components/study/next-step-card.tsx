import { StudyNavLink } from "@/components/study/study-nav-link";
import { TodayPathIllustration } from "@/components/study/today-path-illustration";
import type { TodayNextStep } from "@/types/today";

type NextStepCardProps = {
  data: TodayNextStep;
};

export function NextStepCard({ data }: NextStepCardProps) {
  return (
    <article className="rounded-[20px] bg-study-ink px-6 py-6 text-white sm:px-7">
      <div
        className={
          data.showPath
            ? "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
            : undefined
        }
      >
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-semibold tracking-wide text-study-lime uppercase">
            {data.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-[1.5rem] font-semibold leading-[1.3] sm:text-[1.6875rem]">
            {data.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-[1.4] text-study-on-dark">
            {data.body}
          </p>
          <div className="mt-6 flex flex-col items-start gap-3">
            <StudyNavLink
              href={data.ctaHref}
              className="inline-flex h-[42px] items-center justify-center rounded-[10px] bg-study-lime px-5 text-sm font-medium whitespace-pre text-study-ink transition-[filter] hover:brightness-105"
            >
              {data.ctaLabel}
            </StudyNavLink>
            <p className="text-[0.8125rem] leading-[1.4] text-study-on-dark">
              {data.aside}
            </p>
          </div>
        </div>
        {data.showPath ? (
          <div className="flex shrink-0 justify-center sm:justify-end sm:self-start sm:pt-1">
            <TodayPathIllustration />
          </div>
        ) : null}
      </div>
    </article>
  );
}
