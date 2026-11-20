import { Atom, BookOpen, FlaskConical, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/landing/section-heading";

type PaperCard = {
  kicker: string;
  title: string;
  stats: { value: string; label: string }[];
  Icon: LucideIcon;
  tint: string;
  badge: { label: string; className: string };
  action: string;
  progress?: { answered: number; total: number };
  best?: { score: number; total: number; mistakes: number };
};

const PAPERS: PaperCard[] = [
  {
    kicker: "Full mock · NEET UG",
    title: "NEET Full Mock 1",
    stats: [
      { value: "180", label: "Questions" },
      { value: "180 min", label: "Time" },
      { value: "720", label: "Marks" },
    ],
    Icon: BookOpen,
    tint: "bg-primary-soft",
    badge: { label: "NEW", className: "bg-study-lime text-study-ink" },
    action: "Start test",
  },
  {
    kicker: "Physics · Chapter test",
    title: "Laws of Motion",
    stats: [
      { value: "10", label: "Questions" },
      { value: "10 min", label: "Time" },
      { value: "10", label: "Marks" },
    ],
    Icon: Atom,
    tint: "bg-study-mint",
    badge: { label: "IN PROGRESS", className: "bg-warning/30 text-study-ink" },
    action: "Resume",
    progress: { answered: 4, total: 10 },
  },
  {
    kicker: "Chemistry · Chapter test",
    title: "Structure of Atom",
    stats: [
      { value: "10", label: "Questions" },
      { value: "10 min", label: "Time" },
      { value: "10", label: "Marks" },
    ],
    Icon: FlaskConical,
    tint: "bg-[#f6efd2]",
    badge: { label: "COMPLETED ✓", className: "bg-primary text-primary-foreground" },
    action: "Review",
    best: { score: 6, total: 10, mistakes: 4 },
  },
];

const RING_CIRCUMFERENCE = 188.5;

function ScoreRing({ score, total }: { score: number; total: number }) {
  const filled = (score / total) * RING_CIRCUMFERENCE;
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 80 80"
      role="img"
      aria-label={`Score ${score} of ${total}`}
      className="shrink-0"
    >
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="var(--study-mint)"
        strokeWidth="9"
      />
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${RING_CIRCUMFERENCE}`}
        transform="rotate(-90 40 40)"
      />
    </svg>
  );
}

export function TestsSection() {
  return (
    <section id="tests" className="container-x scroll-mt-20 py-12 md:py-20">
      <SectionHeading
        align="left"
        eyebrow="Practice"
        title="Tests that feel like the real thing"
        description="Pick up where you left off or start something new."
        className="max-w-3xl"
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-5">
        {PAPERS.map((paper) => (
          <article
            key={paper.title}
            className="card-base card-hover flex flex-col overflow-hidden rounded-[28px]"
          >
            <div
              className={`flex h-[76px] items-start justify-between p-3.5 px-[18px] ${paper.tint}`}
              style={{
                backgroundImage:
                  "linear-gradient(rgba(23,61,54,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(23,61,54,.07) 1px,transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              <span className="-mb-[26px] grid h-12 w-12 place-items-center rounded-2xl bg-card text-study-ink">
                <paper.Icon className="h-7 w-7" aria-hidden />
              </span>
              <span
                className={`rounded-xl px-2.5 py-1 text-[10px] font-bold tracking-wider ${paper.badge.className}`}
              >
                {paper.badge.label}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3.5 px-5 pb-5 pt-9">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {paper.kicker}
                </p>
                <h3 className="mt-1 text-xl font-bold leading-tight tracking-tight">
                  {paper.title}
                </h3>
              </div>

              <dl className="flex rounded-2xl border border-border">
                {paper.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex-1 border-l border-border px-3 py-2 first:border-l-0"
                  >
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd className="text-base font-bold">{stat.value}</dd>
                  </div>
                ))}
              </dl>

              {paper.progress ? (
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
                    <span>
                      {paper.progress.answered} of {paper.progress.total}{" "}
                      answered
                    </span>
                    <span>
                      {Math.round(
                        (paper.progress.answered / paper.progress.total) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-study-mint">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(paper.progress.answered / paper.progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}

              {paper.best ? (
                <div className="flex items-center gap-3">
                  <ScoreRing
                    score={paper.best.score}
                    total={paper.best.total}
                  />
                  <p className="text-[13px] font-semibold">
                    Best score {paper.best.score}/{paper.best.total}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {paper.best.mistakes} mistakes in your book
                    </span>
                  </p>
                </div>
              ) : null}

              <Link
                href="/login"
                className="mt-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground transition-[filter] hover:brightness-110"
              >
                {paper.action}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
