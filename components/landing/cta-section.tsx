import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-deep px-6 py-14 text-center md:px-12 md:py-20">
        <div className="bg-dots absolute inset-0" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-primary-foreground md:text-5xl">
            Your rank is built one test at a time.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
            Take your first free mock today and get a full performance report in
            minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="#signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-7 py-3.5 text-base font-semibold text-primary-deep transition-colors hover:bg-primary-soft"
            >
              Start practicing free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
