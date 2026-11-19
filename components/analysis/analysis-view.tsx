"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnalysisDisclaimerCard } from "@/components/analysis/analysis-disclaimer";
import { AnalysisHistoryCard } from "@/components/analysis/analysis-history-card";
import { AnalysisPathwayCard } from "@/components/analysis/analysis-pathway-card";
import { AnalysisPathwaysEmpty } from "@/components/analysis/analysis-pathways-empty";
import { AnalysisPerformanceCard } from "@/components/analysis/analysis-performance-card";
import { AnalysisSubjectsSection } from "@/components/analysis/analysis-subjects-section";
import type { AnalysisPageData, AnalysisPathway } from "@/types/analysis";

type AnalysisViewProps = {
  data: AnalysisPageData;
};

export function AnalysisView({ data }: AnalysisViewProps) {
  const overview = data.overview;
  const latest = overview?.fullMocks.latest ?? null;
  const maxScore = latest?.maxScore ?? overview?.exam.totalMarks ?? 720;
  const hasScore = latest !== null;
  const lockedHistory =
    data.illustrative || !overview?.engagement.hasFullMocks;

  const pathways = useMemo(() => {
    const base = overview?.pathways.offerings ?? [];
    if (base.length === 0) return [];
    if (!hasScore) {
      return base.map(
        (pathway): AnalysisPathway => ({
          ...pathway,
          userPercent: null,
          progress01: 0,
          band: "below",
          message: "Waiting for a score",
        })
      );
    }
    return [...base];
  }, [hasScore, overview?.pathways.offerings]);

  const performanceLabel = latest
    ? `LATEST PERFORMANCE · ${latest.title.toUpperCase()}`
    : "LATEST PERFORMANCE";

  const scoreHint = hasScore
    ? data.illustrative
      ? "Example score · based on marks only"
      : "Based on marks from your latest full mock"
    : "Appears after your first full mock · based on marks only";

  const sectionSubtitle = hasScore
    ? data.sectionSubtitle
    : "Example guidance · not a validated prediction";

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
            {data.title}
          </h1>
          <p className="mt-1 text-sm text-study-muted-soft lg:text-base">
            {data.tagline}
          </p>
          <p className="mt-3 text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
            {hasScore ? data.outlookLabel : "ILLUSTRATIVE MARKS-ONLY OUTLOOK"}
          </p>
        </div>
        <p className="text-[0.6875rem] whitespace-pre text-study-muted-soft">
          {data.examBadge}
        </p>
      </header>

      <AnalysisPerformanceCard
        label={performanceLabel}
        score={hasScore ? latest.score : null}
        maxScore={maxScore}
        scoreHint={scoreHint}
      />

      {overview ? (
        <AnalysisHistoryCard
          examId={overview.exam.id}
          fullMocks={overview.fullMocks}
          locked={lockedHistory}
        />
      ) : null}

      <section className="flex flex-col gap-4 lg:gap-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-study-ink lg:text-xl">
            {data.sectionTitle}
          </h2>
          <p className="mt-1 text-[0.6875rem] font-medium text-study-muted-soft sm:text-xs">
            {sectionSubtitle}
          </p>
        </div>

        {pathways.length === 0 ? (
          <AnalysisPathwaysEmpty />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pathways.map((pathway) => (
              <AnalysisPathwayCard
                key={pathway.id}
                pathway={pathway}
                waiting={!hasScore}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <AnalysisDisclaimerCard disclaimer={data.disclaimer} />
          <Link
            href={data.cutoffHref}
            target="_blank"
            rel="noreferrer"
            className="self-start text-xs font-medium text-study-green transition-colors hover:text-study-ink"
          >
            {data.cutoffLabel}
          </Link>
        </div>
      </section>

      {overview ? (
        <AnalysisSubjectsSection
          examId={overview.exam.id}
          subjects={overview.subjects}
        />
      ) : null}
    </div>
  );
}
