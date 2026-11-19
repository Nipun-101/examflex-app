export type AnalysisPathwayBand = "below" | "borderline" | "comfortable";

export type AnalysisExamRef = {
  id: string;
  name: string;
  totalMarks?: number;
};

export type AnalysisFullMockAttempt = {
  attemptId: string;
  label: string;
  title: string;
  score: number;
  maxScore: number;
  percent: number;
  submittedAt: string;
};

export type AnalysisLatestFullMock = {
  attemptId: string;
  title: string;
  score: number;
  maxScore: number;
  percent: number;
  submittedAt: string;
  deltaFromPrevious: number | null;
  correctCount?: number;
  incorrectCount?: number;
  skippedCount?: number;
};

export type AnalysisFullMocksSection = {
  completedCount: number;
  targetCount: number;
  needsMoreAttempts: boolean;
  latest: AnalysisLatestFullMock | null;
  recent: readonly AnalysisFullMockAttempt[];
};

export type AnalysisPathway = {
  id: string;
  title: string;
  subtitle?: string;
  minPercent: number;
  comfortPercent: number;
  userPercent: number | null;
  progress01: number;
  band: AnalysisPathwayBand;
  message: string;
};

export type AnalysisPathwaysSection = {
  averagePercent: number | null;
  attemptCountUsed: number;
  offerings: readonly AnalysisPathway[];
};

export type AnalysisTopicInsight = {
  topicId: string;
  topicName: string;
  attemptCount: number;
  averagePercent: number;
  isWeak: boolean;
  isStrong: boolean;
};

export type AnalysisSubjectInsight = {
  subjectId: string;
  subjectName: string;
  attemptCount: number;
  averagePercent: number;
  strengthLabel: "Strong" | "Good" | "Weak";
  topics: readonly AnalysisTopicInsight[];
  tip?: string;
};

export type AnalysisSubjectsSection = {
  source: "TOPIC_WISE";
  attemptCount: number;
  needsMoreAttempts: boolean;
  items: readonly AnalysisSubjectInsight[];
};

export type AnalysisEngagement = {
  hasFullMocks: boolean;
  hasChapterWise: boolean;
  fullMockTarget: number;
  fullMocksRemaining: number;
};

export type AnalysisOverview = {
  exam: AnalysisExamRef;
  fullMocks: AnalysisFullMocksSection;
  pathways: AnalysisPathwaysSection;
  subjects: AnalysisSubjectsSection;
  engagement: AnalysisEngagement;
};

/** Presentational page copy + mapped overview for the Analysis UI. */
export type AnalysisPageData = {
  title: string;
  tagline: string;
  examBadge: string;
  outlookLabel: string;
  sectionTitle: string;
  sectionSubtitle: string;
  cutoffLabel: string;
  cutoffHref: string;
  disclaimer: {
    title: string;
    body: string;
  };
  overview: AnalysisOverview | null;
  /** Illustrative fallback when overview is unavailable. */
  illustrative: boolean;
};
