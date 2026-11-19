import type { TodaySessionPlan, TodaySessionStepState } from "@/types/today";

type SessionPlanCardProps = {
  data: TodaySessionPlan;
};

function stepTone(state: TodaySessionStepState): string {
  if (state === "locked") {
    return "text-study-ink/40";
  }
  if (state === "done") {
    return "text-study-ink/70";
  }
  return "text-study-ink";
}

function indexTone(state: TodaySessionStepState): string {
  if (state === "active") {
    return "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-study-ink text-[0.6875rem] font-semibold text-white";
  }
  if (state === "done") {
    return "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-study-ink/30 text-[0.6875rem] font-semibold text-study-ink/70";
  }
  return "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-study-ink/20 text-[0.6875rem] font-medium text-study-ink/35";
}

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
            className={`flex items-center gap-3 text-[0.9375rem] leading-[1.4] ${stepTone(step.state)}`}
          >
            <span className={indexTone(step.state)} aria-hidden>
              {step.index}
            </span>
            <span>
              {step.label}
              {step.state === "locked" ? (
                <span className="sr-only"> (locked)</span>
              ) : null}
              {step.state === "done" ? (
                <span className="sr-only"> (done)</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}
