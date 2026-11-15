import type { AnalysisPathway } from "@/types/analysis";

type AnalysisPathwayCardProps = {
  pathway: AnalysisPathway;
};

export function AnalysisPathwayCard({ pathway }: AnalysisPathwayCardProps) {
  const badgeClass =
    pathway.tone === "stretch"
      ? "bg-study-mint text-study-green"
      : "bg-study-lilac text-study-ink";

  return (
    <article className="rounded-[14px] bg-white px-4 py-3.5 shadow-soft sm:px-5 sm:py-4">
      <h3 className="font-display text-lg font-semibold text-study-ink">
        {pathway.title}
      </h3>
      <p className="mt-1 text-[0.8125rem] text-study-muted-soft">
        {pathway.subtitle}
      </p>
      <p
        className={`mt-3 inline-flex min-h-[23px] w-full items-center rounded-[6px] px-2.5 py-1 text-[0.625rem] font-medium ${badgeClass}`}
      >
        {pathway.badge}
      </p>
    </article>
  );
}
