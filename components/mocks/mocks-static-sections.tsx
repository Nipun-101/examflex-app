const WAYS = [
  {
    title: "Full mocks",
    body: "Timed like the real paper. Ends with your score and a rank range.",
    bestFor: "A weekly check-in",
  },
  {
    title: "Chapter-wise tests",
    body: "One chapter at a time, so you can fix a weak spot fast.",
    bestFor: "After an Equation Book session",
  },
  {
    title: "Sprint tests",
    body: "A short set you can finish between classes.",
    bestFor: "A busy day",
  },
] as const;

const PLAN_FEATURES = [
  {
    title: "Your score, in context",
    body: "Marks, correct, incorrect and a rank range.",
  },
  {
    title: "Mistake Book",
    body: "Every miss with the reason and the NCERT page.",
  },
  {
    title: "Equation Book",
    body: "The formula or detail you missed, saved for review.",
  },
  {
    title: "Analysis",
    body: "Where your range sits against past cutoffs.",
  },
] as const;

/** Static education / marketing strips under the exam cards. */
export function MocksStaticSections() {
  return (
    <div className="space-y-8">
      <section
        aria-label="Sprint teaser"
        className="rounded-[18px] bg-study-mint px-5 py-5 sm:px-6 lg:hidden"
      >
        <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
          Short on time?
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold text-study-ink">
          A sprint test takes minutes, not hours.
        </h2>
        <p className="mt-1 text-sm text-study-muted-soft">
          Coming soon with chapter-wise tests.
        </p>
      </section>

      <section aria-labelledby="three-ways-heading" className="space-y-4">
        <h2
          id="three-ways-heading"
          className="text-[0.6875rem] font-semibold tracking-wide text-study-muted-soft uppercase"
        >
          Three ways to practise
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {WAYS.map((way) => (
            <li
              key={way.title}
              className="rounded-[16px] border border-study-divider bg-white px-4 py-4"
            >
              <h3 className="font-display text-base font-semibold text-study-ink">
                {way.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-study-muted-soft">
                {way.body}
              </p>
              <p className="mt-3 text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
                Best for: {way.bestFor}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="plan-strip-heading"
        className="rounded-[18px] bg-study-lilac px-5 py-6 sm:px-6"
      >
        <h2
          id="plan-strip-heading"
          className="font-display text-xl font-semibold tracking-tight text-study-ink sm:text-2xl"
        >
          Know where you stand.
        </h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_FEATURES.map((feature, index) => (
            <li key={feature.title} className="min-w-0">
              <p className="text-[0.6875rem] font-bold tracking-wide text-study-green uppercase">
                {index + 1}. {feature.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-study-ink/80">
                {feature.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <p className="flex flex-col gap-1 text-xs text-study-muted-soft sm:flex-row sm:justify-between">
        <span>Exams you can open are live. More boards follow.</span>
        <span>Illustrative data · No admission prediction</span>
      </p>
    </div>
  );
}
