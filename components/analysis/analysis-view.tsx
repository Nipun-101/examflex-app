"use client";

import { useMemo, useState } from "react";
import { AnalysisCounselingBookingModal } from "@/components/analysis/analysis-counseling-booking-modal";
import { AnalysisCounselingCard } from "@/components/analysis/analysis-counseling-card";
import { StudyNavLink } from "@/components/study/study-nav-link";
import { AnalysisDisclaimerCard } from "@/components/analysis/analysis-disclaimer";
import { AnalysisHistoryCard } from "@/components/analysis/analysis-history-card";
import { AnalysisPathwayCard } from "@/components/analysis/analysis-pathway-card";
import { AnalysisPathwaysEmpty } from "@/components/analysis/analysis-pathways-empty";
import { AnalysisPerformanceCard } from "@/components/analysis/analysis-performance-card";
import { AnalysisSubjectsSection } from "@/components/analysis/analysis-subjects-section";
import type { AnalysisPageData, AnalysisPathway } from "@/types/analysis";
import type { CounselingPrefill } from "@/types/counseling";

type AnalysisViewProps = {
  data: AnalysisPageData;
  canRequestCounseling?: boolean;
  counselingPrefill?: CounselingPrefill;
  onCounselingBooked?: () => void;
};

const DEFAULT_PREFILL: CounselingPrefill = {
  studentName: "",
  email: "",
  phone: "",
  state: "",
  courseInterestedIn: "",
  expectedMark: "",
  latestMockScore: null,
  latestMockMaxScore: null,
};

export function AnalysisView({
  data,
  canRequestCounseling = true,
  counselingPrefill = DEFAULT_PREFILL,
  onCounselingBooked,
}: AnalysisViewProps) {
  const overview = data.overview;
  const latest = overview?.fullMocks.latest ?? null;
  const maxScore = latest?.maxScore ?? overview?.exam.totalMarks ?? 720;
  const hasScore = latest !== null;
  const lockedHistory =
    data.illustrative || !overview?.engagement.hasFullMocks;
  const examName = overview?.exam.name ?? "ExamFlex";
  const [bookingOpen, setBookingOpen] = useState(false);

  const pathways = useMemo(() => {
    const base = overview?.pathways.offerings ?? [];
    if (base.length === 0) return [];
    if (!hasScore) {
      return base.map(
        (pathway): AnalysisPathway => ({
          ...pathway,
          status: "NO_ATTEMPTS",
          yourMarks: null,
          cutoffMarks: null,
          comfortMarks: null,
          gapMarks: null,
          attemptsConsidered: 0,
          attemptsInWindow: 0,
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

  const prefill = useMemo((): CounselingPrefill => {
    const course =
      counselingPrefill.courseInterestedIn.trim().length > 0
        ? counselingPrefill.courseInterestedIn
        : examName;
    const expected =
      counselingPrefill.expectedMark.trim().length > 0
        ? counselingPrefill.expectedMark
        : latest
          ? `${latest.score} out of ${latest.maxScore}`
          : "";
    return {
      ...counselingPrefill,
      courseInterestedIn: course,
      expectedMark: expected,
      latestMockScore: latest?.score ?? counselingPrefill.latestMockScore,
      latestMockMaxScore:
        latest?.maxScore ?? counselingPrefill.latestMockMaxScore,
    };
  }, [counselingPrefill, examName, latest]);

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

      <AnalysisCounselingCard
        examName={examName}
        canRequest={canRequestCounseling}
        onBook={() => setBookingOpen(true)}
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
          <StudyNavLink
            href={data.cutoffHref}
            target="_blank"
            rel="noreferrer"
            className="self-start text-xs font-medium text-study-green transition-colors hover:text-study-ink"
          >
            {data.cutoffLabel}
          </StudyNavLink>
        </div>
      </section>

      {overview ? (
        <AnalysisSubjectsSection
          examId={overview.exam.id}
          subjects={overview.subjects}
        />
      ) : null}

      {bookingOpen ? (
        <AnalysisCounselingBookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          examName={examName}
          prefill={prefill}
          onBooked={() => {
            onCounselingBooked?.();
          }}
        />
      ) : null}
    </div>
  );
}
