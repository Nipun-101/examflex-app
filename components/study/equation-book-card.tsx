import Link from "next/link";
import type { TodayEquationBook } from "@/types/today";

type EquationBookCardProps = {
  data: TodayEquationBook;
};

export function EquationBookCard({ data }: EquationBookCardProps) {
  return (
    <article className="rounded-[20px] bg-study-lilac px-6 py-5">
      <p className="text-[0.625rem] font-semibold leading-[1.4] text-study-green">
        {data.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[1.5625rem] font-semibold leading-[1.3] text-study-ink">
        {data.title}
      </h2>
      <p className="mt-2 text-[0.9375rem] leading-[1.4] text-study-muted-soft">
        {data.body}
      </p>
      <Link
        href={data.ctaHref}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-[9px] bg-white px-4 text-sm font-medium whitespace-pre text-study-ink shadow-soft transition-colors hover:bg-study-canvas"
      >
        {data.ctaLabel}
      </Link>
    </article>
  );
}
