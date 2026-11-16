import { Check } from "lucide-react";
import {
  papersEmptyContent,
  type PapersEmptyStep,
  type PapersEmptyTip,
} from "@/lib/mocks/papers-empty-content";
import type { PaperType } from "@/types/mock-test";

type PapersEmptyStateProps = {
  paperType: PaperType;
};

function StepGlyph({
  step,
  index,
}: {
  step: PapersEmptyStep;
  index: number;
}) {
  if (step.status === "done") {
    return (
      <span className="grid size-9 place-items-center rounded-full bg-study-ink text-white sm:size-10">
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </span>
    );
  }
  if (step.status === "current") {
    return (
      <span className="grid size-9 place-items-center rounded-full border-2 border-study-ink bg-study-lime text-sm font-bold text-study-ink sm:size-10">
        {index + 1}
      </span>
    );
  }
  return (
    <span className="grid size-9 place-items-center rounded-full border border-study-divider bg-white text-sm font-bold text-study-muted-soft sm:size-10">
      {index + 1}
    </span>
  );
}

function TipCard({ tip }: { tip: PapersEmptyTip }) {
  return (
    <li className="rounded-[14px] border border-study-divider bg-white px-4 py-4">
      <p className="text-[0.6875rem] font-semibold tracking-wide text-study-muted-soft uppercase">
        Tip · {tip.subject}
      </p>
      <p className="mt-2 text-sm leading-relaxed font-semibold text-study-ink">
        {tip.tip}
      </p>
    </li>
  );
}

/** Rich empty state for chapter-wise / full mocks / sprint paper lists. */
export function PapersEmptyState({ paperType }: PapersEmptyStateProps) {
  const content = papersEmptyContent(paperType);

  return (
    <div className="space-y-6" data-testid="papers-empty-state">
      <section
        aria-label="Papers coming soon"
        className="relative overflow-hidden rounded-[22px] bg-study-mint px-5 py-6 sm:px-7 sm:py-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--study-ink) 14%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--study-ink) 14%, transparent) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative">
          <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
            {content.eyebrow}
          </p>
          <h3 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight text-study-ink sm:text-3xl">
            {content.title}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-study-muted-soft sm:text-[0.9375rem]">
            {content.body}
          </p>

          <ol className="relative mt-7 flex flex-col md:mt-8 md:grid md:grid-cols-4 md:gap-4">
            <span
              aria-hidden
              className="absolute top-5 right-[12.5%] left-[12.5%] hidden h-px bg-study-divider md:block"
            />
            {content.steps.map((step, index) => (
              <li
                key={step.label}
                className="relative flex gap-3 pb-6 last:pb-0 md:flex-col md:gap-3 md:pb-0"
              >
                {index < content.steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-9 bottom-0 left-[1.125rem] w-px bg-study-divider md:hidden"
                  />
                ) : null}
                <div className="relative z-10 shrink-0">
                  <StepGlyph step={step} index={index} />
                </div>
                <div className="min-w-0 pt-1 md:pt-0">
                  <p className="text-sm font-semibold text-study-ink">
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-study-muted-soft">
                    {step.statusLabel}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="papers-empty-tips-heading" className="space-y-3">
        <h4
          id="papers-empty-tips-heading"
          className="text-[0.6875rem] font-semibold tracking-wide text-study-muted-soft uppercase"
        >
          {content.tipsHeading}
        </h4>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {content.tips.map((tip) => (
            <TipCard key={tip.subject} tip={tip} />
          ))}
        </ul>
      </section>
    </div>
  );
}
