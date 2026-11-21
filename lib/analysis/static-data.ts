import type { AnalysisPageData } from "@/types/analysis";

const CUTOFF_HREF = "https://www.nta.ac.in/";

/** Shared page chrome for live and illustrative Analysis. */
export const ANALYSIS_PAGE_CHROME = {
  title: "Your possibilities",
  tagline: "Explore a path, not a promise.",
  outlookLabel: "MARKS-BASED OUTLOOK · FULL MOCKS",
  sectionTitle: "What this level could open up",
  sectionSubtitle: "Your recent full mocks vs each course's cut-off",
  cutoffLabel: "Check official counselling cutoffs  ↗",
  cutoffHref: CUTOFF_HREF,
  disclaimer: {
    title: "HOW TO READ THIS",
    body: "All calculations are based entirely on marks only. Authorities may calculate outcomes differently. Rank, category, domicile, quota, eligibility and seat availability are not included. This is an indicator, not an admission guarantee.",
  },
} as const;

/** Empty-state Analysis seed — matches the no-data design. */
export const ANALYSIS_PAGE_DATA: AnalysisPageData = {
  ...ANALYSIS_PAGE_CHROME,
  examBadge: "examflex",
  illustrative: true,
  overview: {
    exam: { id: "illustrative", name: "NEET UG", totalMarks: 720 },
    fullMocks: {
      completedCount: 0,
      targetCount: 5,
      needsMoreAttempts: true,
      latest: null,
      recent: [],
    },
    pathways: {
      averagePercent: null,
      attemptCountUsed: 0,
      offerings: [],
    },
    subjects: {
      source: "TOPIC_WISE",
      attemptCount: 0,
      needsMoreAttempts: true,
      items: [],
    },
    engagement: {
      hasFullMocks: false,
      hasChapterWise: false,
      fullMockTarget: 5,
      fullMocksRemaining: 5,
    },
  },
};

export function buildAnalysisPageData(
  overview: NonNullable<AnalysisPageData["overview"]>,
  options?: { illustrative?: boolean }
): AnalysisPageData {
  return {
    ...ANALYSIS_PAGE_CHROME,
    examBadge: overview.exam.name,
    illustrative: options?.illustrative === true,
    overview,
  };
}
