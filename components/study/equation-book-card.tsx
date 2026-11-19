import Link from "next/link";
import { TodayEquationIllustration } from "@/components/study/today-equation-illustration";
import type { TodayEquationBook } from "@/types/today";

type EquationBookCardProps = {
  data: TodayEquationBook;
};

export function EquationBookCard({ data }: EquationBookCardProps) {
  return (
    <article className="rounded-[20px] bg-study-lilac px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-semibold leading-[1.4] text-study-green">
            {data.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-[1.5625rem] font-semibold leading-[1.3] text-study-ink">
            {data.title}
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-[1.4] text-study-muted-soft">
            {data.body}
          </p>
        </div>
        <TodayEquationIllustration />
      </div>

      <div className="mt-5 flex flex-col items-start gap-4">
        {data.statusPill ? (
          <p className="inline-flex max-w-full rounded-full border border-dashed border-study-ink/20 px-3.5 py-1.5 text-[0.75rem] leading-[1.4] text-study-muted-soft">
            {data.statusPill}
          </p>
        ) : null}

        <Link
          href={data.ctaHref}
          className="ml-1 inline-flex text-sm font-semibold whitespace-pre text-study-green transition-colors hover:text-study-ink"
        >
          {data.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
