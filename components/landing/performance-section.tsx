import {
  CalendarDays,
  ChartColumn,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";

const STATS: {
  value: string;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "612/720", label: "Predicted score", Icon: Trophy },
  { value: "81%", label: "Accuracy", Icon: Target },
  { value: "#1,284", label: "Rank (mock)", Icon: ChartColumn },
  { value: "23 days", label: "Study streak", Icon: CalendarDays },
];

const WEEKLY_SCORES = [42, 48, 51, 55, 58, 62, 68, 72] as const;

const SUBJECTS = [
  { name: "Physics", score: 78 },
  { name: "Chemistry", score: 86 },
  { name: "Mathematics", score: 64 },
] as const;

export function PerformanceSection() {
  const maxScore = Math.max(...WEEKLY_SCORES);

  return (
    <section
      id="performance"
      className="scroll-mt-20 bg-secondary/60 py-16 md:py-24"
    >
      <div className="container-x">
        <SectionHeading
          eyebrow="Performance"
          title="Know exactly where you stand"
          description="Every test turns into insights — so you always know what moves your score."
        />

        <div className="mt-10">
          <div className="card-base overflow-hidden p-4 md:p-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-secondary p-4">
                  <stat.Icon className="h-5 w-5 text-primary" aria-hidden />
                  <div className="mt-3 font-display text-xl font-bold md:text-2xl">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <article className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h4 className="text-lg font-bold">Mock test scores</h4>
                  <span className="rounded-full bg-neet-soft px-2.5 py-1 text-xs font-semibold text-neet">
                    +27% in 8 weeks
                  </span>
                </div>

                <div className="mt-6">
                  <div className="flex h-36 items-end gap-1.5 sm:h-40 sm:gap-2.5">
                    {WEEKLY_SCORES.map((score, index) => {
                      const heightPct = (score / maxScore) * 100;
                      return (
                        <div
                          key={`bar-${index + 1}`}
                          className="relative h-full min-w-0 flex-1"
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-primary"
                            style={{ height: `${heightPct}%` }}
                            title={`Week ${index + 1}: ${score}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex gap-1.5 sm:gap-2.5">
                    {WEEKLY_SCORES.map((_, index) => (
                      <span
                        key={`label-${index + 1}`}
                        className="min-w-0 flex-1 text-center text-[10px] font-medium text-muted-foreground sm:text-xs"
                      >
                        W{index + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-lg font-bold">Subject performance</h4>
                <div className="mt-6 space-y-5">
                  {SUBJECTS.map((subject) => (
                    <div key={subject.name}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium">{subject.name}</span>
                        <span className="font-semibold">{subject.score}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-primary"
                          style={{ width: `${subject.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">
                  💡 Focus next: Integration by parts — 3 recommended drills
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
