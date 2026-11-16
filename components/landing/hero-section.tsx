import { ArrowRight, CircleCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const TRUST_ITEMS = [
  "50,000+ questions",
  "NTA-pattern tests",
  "All-India ranking",
] as const;

export function HeroSection() {
  return (
    <section className="bg-hero-gradient relative overflow-hidden">
      <div className="container-x grid items-center gap-10 pb-16 pt-8 md:pt-14 lg:grid-cols-2 lg:pb-24">
        <div className="animate-fade-up text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            NEET &amp; JEE 2027 batches are live
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Rise above <span className="text-primary">cutoffs.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg lg:mx-0">
            Exam-level mock tests, focused practice and analytics that show
            exactly what to fix next — so every hour you study counts.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lift transition-[filter] hover:brightness-110"
            >
              Start Preparing
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="#tests"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 text-base font-semibold text-foreground shadow-soft transition-colors hover:bg-muted"
            >
              Explore Tests
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CircleCheck
                  className="h-4 w-4 text-success"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up-delay relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-border/60 bg-[linear-gradient(160deg,#e8f5ef_0%,#dceee6_45%,#c5e4d8_100%)] shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <span className="absolute left-6 top-10 font-display text-2xl font-bold text-primary/35">
                E=mc²
              </span>
              <span className="absolute right-8 top-24 text-sm font-medium text-primary/30">
                v = u + at
              </span>
              <span className="absolute bottom-28 left-8 text-sm text-primary/30">
                2H₂ + O₂ → 2H₂O
              </span>
              <span className="absolute right-10 bottom-36 font-display text-xl text-primary/25">
                ∫ dx
              </span>
              <div className="absolute left-1/2 top-[42%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 bg-white/25 blur-[1px]" />
              <div className="absolute right-12 top-[34%] h-16 w-16 rounded-2xl bg-white/45 shadow-soft" />
              <div className="absolute bottom-[38%] left-10 h-12 w-20 rounded-xl bg-white/35 shadow-soft" />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-primary/25 to-transparent" />

            <div className="absolute right-4 top-6 rounded-2xl bg-card px-4 py-3 shadow-lift sm:right-6 sm:top-8">
              <p className="text-xs text-muted-foreground">Mock rank</p>
              <p className="font-display text-xl font-bold text-foreground">
                Top 3%
              </p>
            </div>

            <div className="absolute bottom-6 left-4 flex items-center gap-2.5 rounded-2xl bg-card px-3.5 py-3 shadow-lift sm:left-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-neet-soft text-neet">
                <CircleCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Accuracy this week</p>
                <p className="text-sm font-bold text-foreground">+14%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
