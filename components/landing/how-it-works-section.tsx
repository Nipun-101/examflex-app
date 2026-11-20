import { SectionHeading } from "@/components/landing/section-heading";

const STEPS = [
  {
    title: "Take a mock",
    description:
      "Timed, NTA-pattern. A full syllabus mock or one chapter at a time.",
    tone: "bg-study-mint",
  },
  {
    title: "Understand every miss",
    description:
      "Your Mistake Book gives each one a reason, an NCERT page and a timer.",
    tone: "bg-study-lilac",
  },
  {
    title: "Recall, don’t reread",
    description: "Missed formulas and lines return as Equation Book flashcards.",
    tone: "bg-[#f6efd2]",
  },
  {
    title: "See where you stand",
    description: "A score in context, a rank range and what to fix next.",
    tone: "bg-card border border-border",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how" className="container-x scroll-mt-20 py-12 md:py-20">
      <SectionHeading
        align="left"
        eyebrow="How it works"
        title="One loop. Every test makes the next one better."
        description="Four steps that turn practice into progress."
        className="max-w-3xl"
      />

      <ol className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className={`rounded-[22px] p-5 ${step.tone}`}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[15px] font-bold text-study-lime">
              {index + 1}
            </span>
            <h3 className="mb-1.5 mt-3.5 text-[19px] font-bold tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
