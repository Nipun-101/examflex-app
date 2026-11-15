import {
  ArrowRight,
  Atom,
  Dna,
  FlaskConical,
  Sigma,
  Stethoscope,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/landing/section-heading";

const EXAMS: {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  cta: string;
  tone: "neet" | "jee";
  Icon: LucideIcon;
  subjects: { label: string; Icon: LucideIcon }[];
}[] = [
  {
    title: "NEET",
    subtitle: "For future doctors",
    description: "National Eligibility cum Entrance Test",
    badge: "180 Qs · 720 marks",
    cta: "Start NEET prep",
    tone: "neet",
    Icon: Stethoscope,
    subjects: [
      { label: "Physics", Icon: Atom },
      { label: "Chemistry", Icon: FlaskConical },
      { label: "Biology", Icon: Dna },
    ],
  },
  {
    title: "JEE",
    subtitle: "For future engineers",
    description: "Joint Entrance Examination — Main & Advanced",
    badge: "75 Qs · 300 marks",
    cta: "Start JEE prep",
    tone: "jee",
    Icon: Wrench,
    subjects: [
      { label: "Physics", Icon: Atom },
      { label: "Chemistry", Icon: FlaskConical },
      { label: "Mathematics", Icon: Sigma },
    ],
  },
];

export function ExamsSection() {
  return (
    <section id="courses" className="container-x scroll-mt-20 py-16 md:py-24">
      <SectionHeading
        eyebrow="Choose your goal"
        title="Which exam are you cracking?"
        description="Tailored syllabus, tests and analytics for your exam."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {EXAMS.map((exam) => {
          const isNeet = exam.tone === "neet";
          return (
            <Link
              key={exam.title}
              href="#signup"
              className="card-base card-hover group relative overflow-hidden p-6 md:p-8"
            >
              <div
                aria-hidden
                className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${
                  isNeet ? "bg-neet-soft" : "bg-jee-soft"
                }`}
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground ${
                      isNeet ? "bg-neet" : "bg-jee"
                    }`}
                  >
                    <exam.Icon className="h-7 w-7" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {exam.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-3xl font-extrabold md:text-4xl">
                  {exam.title}
                </h3>
                <p
                  className={`text-sm font-semibold ${
                    isNeet ? "text-neet" : "text-jee"
                  }`}
                >
                  {exam.subtitle}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {exam.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {exam.subjects.map((subject) => (
                    <span
                      key={subject.label}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium"
                    >
                      <subject.Icon
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden
                      />
                      {subject.label}
                    </span>
                  ))}
                </div>

                <span
                  className={`mt-7 inline-flex items-center gap-1.5 text-sm font-bold ${
                    isNeet ? "text-neet" : "text-jee"
                  }`}
                >
                  {exam.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
