import Link from "next/link";
import type { TodayNextStep } from "@/types/today";

type NextStepCardProps = {
  data: TodayNextStep;
};

export function NextStepCard({ data }: NextStepCardProps) {
  return (
    <article className="rounded-[20px] bg-study-ink px-6 py-6 text-white sm:px-7">
      <p className="text-[0.6875rem] font-semibold tracking-wide text-study-lime uppercase">
        {data.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[1.5rem] font-semibold leading-[1.3] sm:text-[1.6875rem]">
        {data.title}
      </h2>
      <p className="mt-3 max-w-2xl text-[0.9375rem] leading-[1.4] text-study-on-dark">
        {data.body}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <Link
          href={data.ctaHref}
          className="inline-flex h-[42px] items-center justify-center rounded-[10px] bg-study-lime px-5 text-sm font-medium whitespace-pre text-study-ink transition-[filter] hover:brightness-105"
        >
          {data.ctaLabel}
        </Link>
        <p className="text-[0.8125rem] leading-[1.4] text-study-on-dark">
          {data.aside}
        </p>
      </div>
    </article>
  );
}
