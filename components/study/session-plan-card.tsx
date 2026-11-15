import type { TodaySessionPlan } from "@/types/today";

type SessionPlanCardProps = {
  data: TodaySessionPlan;
};

export function SessionPlanCard({ data }: SessionPlanCardProps) {
  return (
    <article className="rounded-[20px] bg-study-mint px-6 py-6">
      <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
        {data.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.3] text-study-ink">
        {data.title}
      </h2>
      <ol className="mt-5 space-y-3">
        {data.steps.map((step) => (
          <li
            key={step.index}
            className="flex gap-3 text-[0.9375rem] leading-[1.4] text-study-ink"
          >
            <span className="w-7 shrink-0 font-medium tabular-nums">
              {step.index}
            </span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
