const TAGS = [
  { label: "Concept gap", active: true },
  { label: "Calculation", active: false },
  { label: "Time", active: false },
] as const;

export function ToolsSection() {
  return (
    <section className="container-x grid gap-4 py-6 lg:grid-cols-[1.2fr_1fr] lg:gap-5">
      <article
        id="mistake-book"
        className="card-base flex scroll-mt-20 flex-col gap-4 rounded-[28px] p-6 md:p-8"
      >
        <div>
          <span className="inline-block rounded-xl bg-study-mint px-3 py-1.5 text-xs font-semibold text-primary">
            Mistake Book
          </span>
          <h3 className="mb-2 mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-[28px]">
            Every mistake gets a reason, a page and a timer.
          </h3>
          <p className="text-[15px] text-muted-foreground">
            Wrong answers and blanks both land here. Clear them when the idea
            sticks.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 rounded-[20px] bg-background p-4">
          <div className="flex items-center justify-between rounded-xl bg-study-lilac px-3.5 py-2.5">
            <div>
              <p className="text-[11px] text-muted-foreground">
                Time to understand
              </p>
              <p className="text-[22px] font-bold">02:14</p>
            </div>
            <span className="rounded-xl bg-card px-3.5 py-2 text-[13px] font-semibold">
              Stop
            </span>
          </div>
          <p className="text-[13px] font-semibold text-study-green">
            NCERT XI · Laws of motion · Friction ↗
          </p>
          <p className="text-[13px] font-semibold">What tripped you up?</p>
          <ul className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <li
                key={tag.label}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold ${
                  tag.active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card"
                }`}
              >
                {tag.label}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <article
        id="equation-book"
        className="flex scroll-mt-20 flex-col gap-4 rounded-[28px] bg-study-lilac p-6 md:p-8"
      >
        <div>
          <span className="inline-block rounded-xl bg-card px-3 py-1.5 text-xs font-semibold text-primary">
            Equation Book
          </span>
          <h3 className="mb-2 mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-[28px]">
            Recall it. Don’t just recognise it.
          </h3>
          <p className="text-[15px] text-study-lilac-ink">
            Formulas you missed come back as flashcards, until the chapter feels
            automatic.
          </p>
        </div>

        <div className="rounded-[20px] bg-card p-[18px]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-study-green">
            From your Mistake Book · Q34
          </p>
          <p className="mb-1 mt-2 text-xl font-bold tracking-tight">
            Sliding down a rough incline?
          </p>
          <p className="my-3 border-t border-border pt-3 font-serif text-[22px] font-semibold italic">
            a = g (sin θ − μ<sub>k</sub> cos θ)
          </p>
          <p className="text-xs text-muted-foreground">
            Card 3 of 8 · Laws of motion
          </p>
        </div>
      </article>
    </section>
  );
}
