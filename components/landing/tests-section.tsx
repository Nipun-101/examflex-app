import { ArrowRight, Clock, FileText, Users } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/landing/section-heading";

const TESTS = [
  {
    exam: "NEET" as const,
    difficulty: "Hard" as const,
    title: "NEET Full Mock Test #12",
    questions: 180,
    duration: "200 min",
    attempts: "24.1k",
    progress: 0,
    action: "Start test",
  },
  {
    exam: "JEE" as const,
    difficulty: "Medium" as const,
    title: "JEE Main — Physics Sprint",
    questions: 30,
    duration: "60 min",
    attempts: "11.8k",
    progress: 65,
    action: "Resume",
  },
  {
    exam: "NEET" as const,
    difficulty: "Medium" as const,
    title: "Organic Chemistry: Reaction Mechanisms",
    questions: 45,
    duration: "50 min",
    attempts: "9.2k",
    progress: 30,
    action: "Resume",
  },
];

export function TestsSection() {
  return (
    <section id="tests" className="container-x scroll-mt-20 py-16 md:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <SectionHeading
          eyebrow="Practice"
          title="Tests that feel like the real thing"
          description="Pick up where you left off or start something new."
          align="center"
          className="md:mx-0 md:max-w-xl md:text-left"
        />
        <Link
          href="#tests"
          className="mx-auto inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline md:mx-0"
        >
          View all tests
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-3">
        {TESTS.map((test) => (
          <article
            key={test.title}
            className="card-base card-hover flex flex-col p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  test.exam === "NEET"
                    ? "bg-neet-soft text-neet"
                    : "bg-jee-soft text-jee"
                }`}
              >
                {test.exam}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  test.difficulty === "Hard"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary-soft text-primary"
                }`}
              >
                {test.difficulty}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-bold leading-snug">{test.title}</h3>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-4 w-4 shrink-0" aria-hidden />
                {test.questions} Qs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" aria-hidden />
                {test.duration}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0" aria-hidden />
                {test.attempts}
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">
                  {test.progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${test.progress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {test.action}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
