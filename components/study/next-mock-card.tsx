import Link from "next/link";
import type { TodayNextMock } from "@/types/today";

type NextMockCardProps = {
  data: TodayNextMock;
};

export function NextMockCard({ data }: NextMockCardProps) {
  return (
    <article className="rounded-[20px] bg-white px-6 py-5 shadow-soft">
      <p className="text-[0.625rem] font-semibold leading-[1.4] text-study-green">
        {data.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold leading-[1.3] text-study-ink">
        {data.title}
      </h2>
      <p className="mt-3 text-[0.8125rem] leading-[1.4] whitespace-pre-wrap text-study-muted-soft">
        {data.meta}
      </p>
      <Link
        href={data.ctaHref}
        className="mt-4 inline-flex text-[0.8125rem] font-semibold whitespace-pre text-study-green transition-colors hover:text-study-ink"
      >
        {data.ctaLabel}
      </Link>
    </article>
  );
}
