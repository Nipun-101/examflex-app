type TodayOverviewProps = {
  eyebrow: string;
  headline: string;
  subhead: string;
  paceBadge: string;
};

export function TodayOverview({
  eyebrow,
  headline,
  subhead,
  paceBadge,
}: TodayOverviewProps) {
  return (
    <section
      aria-labelledby="today-headline"
      className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8"
    >
      <div className="min-w-0 max-w-3xl">
        <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
          {eyebrow}
        </p>
        <h1
          id="today-headline"
          className="mt-2 font-display text-[1.875rem] font-semibold leading-[1.2] tracking-tight text-study-ink sm:text-[2.125rem] lg:text-[2.375rem]"
        >
          {headline}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-[1.4] text-study-muted">
          {subhead}
        </p>
      </div>

      <p className="inline-flex h-[42px] shrink-0 items-center justify-center self-start rounded-[10px] bg-white px-4 text-sm font-medium whitespace-pre text-study-ink shadow-soft">
        {paceBadge}
      </p>
    </section>
  );
}
