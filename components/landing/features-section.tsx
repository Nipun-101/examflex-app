import {
  Brain,
  ChartColumn,
  ClipboardCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";

const FEATURES: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Real mock tests",
    description:
      "NTA-pattern full and chapter tests with the same timer, marking and interface as exam day.",
    Icon: ClipboardCheck,
  },
  {
    title: "Performance analytics",
    description:
      "See accuracy, speed and rank by subject, chapter and topic — after every single test.",
    Icon: ChartColumn,
  },
  {
    title: "Personalized practice",
    description:
      "Adaptive question sets that target your weak topics instead of repeating what you know.",
    Icon: Brain,
  },
  {
    title: "Smart recommendations",
    description:
      "A clear daily plan: what to revise, what to practise and which test to take next.",
    Icon: Sparkles,
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-secondary/60 py-16 md:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Why ExamFlex"
          title="Study smarter, not just longer"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="card-base card-hover p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <feature.Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
