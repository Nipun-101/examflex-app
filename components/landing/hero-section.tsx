import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { HeroVisual } from "@/components/landing/hero-visual";

const TRUST_ITEMS = [
  "NTA-pattern mocks",
  "NCERT-referenced",
  "Practice, not classes",
] as const;

export function HeroSection() {
  return (
    <section className="bg-hero-gradient relative overflow-hidden">
      <div className="container-x grid items-center gap-10 pb-12 pt-6 md:pt-10 lg:grid-cols-[minmax(0,1fr)_560px] lg:gap-14 lg:pb-20">
        <div className="animate-fade-up flex flex-col items-start gap-5 lg:gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-2 text-xs font-semibold text-primary sm:text-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            NEET 2027 batches are live · JEE coming soon
          </span>

          <h1 className="text-5xl font-extrabold leading-none tracking-tighter text-primary-deep sm:text-6xl lg:text-7xl">
            Rise above <span className="text-primary">cutoffs.</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Exam-level mocks, a Mistake Book that shows why you lost marks, and a
            score you can read in college terms. So every hour you study counts.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 text-base font-semibold text-primary-foreground shadow-lift transition-[filter] hover:brightness-110"
            >
              Start preparing
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="#tests"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-border bg-card px-7 text-base font-semibold text-foreground shadow-soft transition-colors hover:bg-muted"
            >
              Explore tests
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
