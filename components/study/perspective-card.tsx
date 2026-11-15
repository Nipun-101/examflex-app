import Link from "next/link";
import type { TodayPerspective } from "@/types/today";

type PerspectiveCardProps = {
  data: TodayPerspective;
  className?: string;
};

export function PerspectiveCard({ data, className = "" }: PerspectiveCardProps) {
  return (
    <article
      className={`rounded-[20px] bg-study-mint px-6 py-5 ${className}`.trim()}
    >
      <p className="text-[0.625rem] font-semibold leading-[1.4] text-study-green">
        {data.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[1.375rem] font-semibold leading-[1.3] text-study-ink">
        {data.title}
      </h2>
      <p className="mt-3 text-[0.8125rem] leading-[1.4] text-study-muted-soft">
        {data.body}
      </p>
      <Link
        href={data.ctaHref}
        className="mt-4 inline-flex text-sm font-semibold whitespace-pre text-study-green transition-colors hover:text-study-ink"
      >
        {data.ctaLabel}
      </Link>
    </article>
  );
}
