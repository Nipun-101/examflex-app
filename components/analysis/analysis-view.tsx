"use client";

import { useState } from "react";
import Link from "next/link";
import { AnalysisDisclaimerCard } from "@/components/analysis/analysis-disclaimer";
import { AnalysisPathwayCard } from "@/components/analysis/analysis-pathway-card";
import { AnalysisPerformanceCard } from "@/components/analysis/analysis-performance-card";
import type { AnalysisPageData } from "@/types/analysis";

type AnalysisViewProps = {
  data: AnalysisPageData;
};

export function AnalysisView({ data }: AnalysisViewProps) {
  const [score, setScore] = useState(data.performance.score);

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
            {data.outlookLabel}
          </p>
        </div>
        <p className="text-[0.6875rem] whitespace-pre text-study-muted-soft">
          {data.examBadge}
        </p>
      </header>

      <AnalysisPerformanceCard
        performance={data.performance}
        score={score}
        onScoreChange={setScore}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.9fr)] lg:items-end lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-study-ink lg:text-xl">
              {data.sectionTitle}
            </h2>
            <p className="mt-1 text-[0.6875rem] font-medium text-study-muted-soft sm:text-xs">
              {data.sectionSubtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.pathways.map((pathway) => (
              <AnalysisPathwayCard key={pathway.id} pathway={pathway} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:gap-5">
          <Link
            href={data.cutoffHref}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium whitespace-pre-wrap text-study-green transition-colors hover:text-study-ink"
          >
            {data.cutoffLabel}
          </Link>
          <AnalysisDisclaimerCard disclaimer={data.disclaimer} />
        </aside>
      </div>
    </div>
  );
}
