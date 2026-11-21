import {
  PATHWAY_BAND_LABEL,
  describePathwayBasis,
  formatMarks,
  pathwayBarGeometry,
} from "@/lib/analysis/pathway-bands";
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

function CardHeader({
  pathway,
  band,
}: {
  pathway: AnalysisPathway;
  band?: AnalysisPathway["band"];
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-display text-lg font-semibold text-study-ink">
          {pathway.title}
        </h3>
        {pathway.subtitle ? (
          <p className="mt-1 text-[0.8125rem] text-study-muted-soft">
            {pathway.subtitle}
          </p>
        ) : null}
      </div>
      {band ? (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold ${bandBadgeClass(band)}`}
        >
          {PATHWAY_BAND_LABEL[band]}
        </span>
      ) : null}
    </div>
  );
}

function MarksStat({
  label,
  value,
  of,
  align = "left",
}: {
  label: string;
  value: number;
  of?: number | null;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p className="text-[0.625rem] font-medium tracking-wide text-study-muted-soft uppercase">
        {label}
      </p>
      <p className="mt-0.5 font-display text-2xl font-semibold text-study-ink">
        {formatMarks(value)}
        {of ? (
          <span className="ml-1 text-sm font-medium text-study-muted-soft">
            / {formatMarks(of)}
          </span>
        ) : null}
      </p>
    </div>
  );
}

export function AnalysisPathwayCard({
  pathway,
  waiting = false,
}: AnalysisPathwayCardProps) {
  if (waiting || pathway.status === "NO_ATTEMPTS") {
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

  // Attempts exist but no recent mock has a cut-off for this course yet.
  if (pathway.status === "NO_CUTOFF") {
    return (
      <article className="rounded-[14px] bg-white px-4 py-3.5 shadow-soft sm:px-5 sm:py-4">
        <CardHeader pathway={pathway} />
        {typeof pathway.yourMarks === "number" ? (
          <div className="mt-3">
            <MarksStat
              label="Your weighted marks"
              value={pathway.yourMarks}
              of={pathway.maxMarks}
            />
          </div>
        ) : null}
        <p className="mt-3 inline-flex min-h-[23px] w-full items-center rounded-[6px] bg-study-lilac px-2.5 py-1 text-[0.625rem] font-medium text-study-lilac-ink">
          {pathway.message}
        </p>
        <p className="mt-2 text-[0.625rem] text-study-muted-soft">
          {describePathwayBasis(pathway)} · recent ones count more
        </p>
      </article>
    );
  }

  const hasMarks =
    typeof pathway.yourMarks === "number" &&
    typeof pathway.cutoffMarks === "number" &&
    typeof pathway.comfortMarks === "number";

  // Older API payloads only carry percentages; keep the card usable.
  if (!hasMarks) {
    const widthPercent = Math.round(
      Math.min(100, Math.max(0, pathway.progress01 * 100))
    );
    return (
      <article className="rounded-[14px] bg-white px-4 py-3.5 shadow-soft sm:px-5 sm:py-4">
        <CardHeader pathway={pathway} />
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

  const yourMarks = pathway.yourMarks as number;
  const cutoffMarks = pathway.cutoffMarks as number;
  const comfortMarks = pathway.comfortMarks as number;
  const geometry = pathwayBarGeometry({
    yourMarks,
    cutoffMarks,
    comfortMarks,
    maxMarks: pathway.maxMarks,
  });
  const scaleLabel = formatMarks(geometry.scaleMax);

  return (
    <article className="rounded-[14px] bg-white px-4 py-3.5 shadow-soft sm:px-5 sm:py-4">
      <CardHeader pathway={pathway} band={pathway.band} />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MarksStat
          label="Your weighted marks"
          value={yourMarks}
          of={geometry.scaleMax}
        />
        <MarksStat label="Cut-off" value={cutoffMarks} align="right" />
      </div>

      <div className="mt-3">
        <div
          className="relative h-2.5 rounded-full bg-study-divider/40"
          role="img"
          aria-label={`${pathway.title}: your weighted marks ${formatMarks(yourMarks)} out of ${scaleLabel}; cut-off ${formatMarks(cutoffMarks)}`}
        >
          <div
            data-testid="pathway-comfort-zone"
            className="absolute top-0 h-full bg-study-mint"
            style={{
              left: `${geometry.cutoffPct}%`,
              width: `${geometry.comfortZonePct}%`,
            }}
          />
          <div
            data-testid="pathway-fill"
            className={`absolute top-0 left-0 h-full rounded-full transition-[width] ${bandFillClass(pathway.band)}`}
            style={{ width: `${geometry.fillPct}%` }}
          />
          <div
            data-testid="pathway-cutoff-tick"
            className="absolute -top-[3px] h-[16px] w-[2px] -translate-x-1/2 rounded-full bg-study-ink"
            style={{ left: `${geometry.cutoffPct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[0.625rem] text-study-muted-soft">
          <span>0</span>
          <span>{scaleLabel}</span>
        </div>
      </div>

      <p
        className={`mt-3 inline-flex min-h-[23px] w-full items-center rounded-[6px] px-2.5 py-1 text-[0.625rem] font-medium ${bandBadgeClass(pathway.band)}`}
      >
        {pathway.message}
      </p>
      <p className="mt-2 text-[0.625rem] text-study-muted-soft">
        {describePathwayBasis(pathway)} · recent ones count more
      </p>
    </article>
  );
}
