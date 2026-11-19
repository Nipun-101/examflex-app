import type { AnalysisPathway } from "@/types/analysis";

type AnalysisPathwayCardProps = {
  pathway: AnalysisPathway;
  waiting?: boolean;
};

function bandBadgeClass(band: AnalysisPathway["band"]): string {
  if (band === "comfortable") return "bg-study-mint text-study-green";
  if (band === "borderline") return "bg-study-lilac text-study-lilac-ink";
  return "bg-study-peach text-study-peach-ink";
}

function bandFillClass(band: AnalysisPathway["band"]): string {
  if (band === "comfortable") return "bg-study-green";
  if (band === "borderline") return "bg-amber-400";
  return "bg-rose-400";
}

export function AnalysisPathwayCard({
  pathway,
  waiting = false,
}: AnalysisPathwayCardProps) {
  const isWaiting = waiting || pathway.userPercent === null;
  const widthPercent = Math.round(
    Math.min(100, Math.max(0, pathway.progress01 * 100))
  );

  if (isWaiting) {
    return (
      <article className="rounded-[14px] border border-dashed border-study-divider bg-white px-4 py-3.5 sm:px-5 sm:py-4">
        <h3 className="font-display text-lg font-semibold text-study-ink">
          {pathway.title}
        </h3>
        {pathway.subtitle ? (
          <p className="mt-1 text-[0.8125rem] text-study-muted-soft">
            {pathway.subtitle}
          </p>
        ) : null}
        <p className="mt-3 inline-flex min-h-[23px] items-center rounded-[6px] bg-study-lilac px-2.5 py-1 text-[0.625rem] font-medium text-study-lilac-ink">
          Waiting for a score
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-[14px] bg-white px-4 py-3.5 shadow-soft sm:px-5 sm:py-4">
      <h3 className="font-display text-lg font-semibold text-study-ink">
        {pathway.title}
      </h3>
      {pathway.subtitle ? (
        <p className="mt-1 text-[0.8125rem] text-study-muted-soft">
          {pathway.subtitle}
        </p>
      ) : null}

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2 text-[0.625rem] font-medium text-study-muted-soft">
          <span>Your avg vs {pathway.minPercent}%</span>
          <span>{`${Math.round(pathway.userPercent ?? 0)}%`}</span>
        </div>
        <div
          className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100"
          role="img"
          aria-label={`Progress ${widthPercent}% toward ${pathway.title} minimum`}
        >
          <div
            className={`h-full rounded-full transition-[width] ${bandFillClass(pathway.band)}`}
            style={{ width: `${widthPercent}%` }}
          />
        </div>
      </div>

      <p
        className={`mt-3 inline-flex min-h-[23px] w-full items-center rounded-[6px] px-2.5 py-1 text-[0.625rem] font-medium ${bandBadgeClass(pathway.band)}`}
      >
        {pathway.message}
      </p>
    </article>
  );
}
