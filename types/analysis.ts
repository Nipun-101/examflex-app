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
  /** Marks for a correct answer (e.g. 4). */
  marksPerCorrect?: number;
  /** Marks lost per wrong answer, as a positive number (e.g. 1). */
  negativeMarking?: number;
  durationInMinutes?: number;
  /** Time used, excluding pauses. */
  timeTakenSeconds?: number;
};

export type AnalysisFullMocksSection = {
  completedCount: number;
  targetCount: number;
  needsMoreAttempts: boolean;
  latest: AnalysisLatestFullMock | null;
  recent: readonly AnalysisFullMockAttempt[];
};

/**
 * NO_ATTEMPTS: no completed full mock yet.
 * NO_CUTOFF: attempts exist, but no recent mock has a cut-off for this course.
 * EVALUATED: marks vs cut-off are meaningful; band and bar apply.
 */
export type AnalysisPathwayStatus = "NO_ATTEMPTS" | "NO_CUTOFF" | "EVALUATED";

export type AnalysisPathway = {
  id: string;
  title: string;
  subtitle?: string;
  status: AnalysisPathwayStatus;
  /** Recency-weighted marks over the last <=10 full mocks. */
  yourMarks: number | null;
  /** Same-weighted cut-off marks of those mocks. EVALUATED only. */
  cutoffMarks: number | null;
  /** Cut-off plus the comfort margin. EVALUATED only. */
  comfortMarks: number | null;
  /** yourMarks - cutoffMarks (negative = short). EVALUATED only. */
  gapMarks: number | null;
  /** Scale of the paper(s), e.g. 720 for NEET, 300 for JEE. */
  maxMarks: number | null;
  /** Mocks behind yourMarks / cutoffMarks. */
  attemptsConsidered: number;
  /** Latest full mocks looked at (<= 10). */
  attemptsInWindow: number;
  /** @deprecated Derived by the API for older clients; marks are the source of truth. */
  minPercent: number;
  /** @deprecated See minPercent. */
  comfortPercent: number;
  /** @deprecated See minPercent. */
  userPercent: number | null;
  /** 0-1: yourMarks / cutoffMarks, capped at 1. */
  progress01: number;
  /** Only meaningful when status is EVALUATED. */
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
