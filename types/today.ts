export type TodayMode = "empty" | "active";

export type TodaySessionStepState = "active" | "locked" | "done";

export type TodayOverview = {
  eyebrow: string;
  headline: string;
  subhead: string;
  paceBadge: string;
};

export type TodayNextStep = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  aside: string;
  showPath: boolean;
};

export type TodaySessionStep = {
  index: string;
  label: string;
  state: TodaySessionStepState;
};

export type TodaySessionPlan = {
  eyebrow: string;
  title: string;
  steps: readonly TodaySessionStep[];
};

export type TodayMockAttempt = {
  id: string;
  label: string;
  score: number | null;
};

export type TodayLatestMock = {
  title: string;
  meta: string;
  score: number | null;
  maxScore: number;
  deltaLabel: string | null;
  breakdown: string | null;
  placeholderMessage: string | null;
  attempts: readonly TodayMockAttempt[];
};

export type TodaySubjectInsight = {
  subject: string;
  scoreLabel: string;
  tip: string;
  averagePercent: number | null;
};

export type TodaySubjectInsightsSection = {
  title: string;
  subhead: string | null;
  items: readonly TodaySubjectInsight[];
};

export type TodayEquationBook = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  statusPill: string | null;
};

export type TodayMistakeBook = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  statusPill: string | null;
};

export type TodayNextMock = {
  eyebrow: string;
  title: string;
  meta: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TodayPerspective = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  locked: boolean;
};

export type TodayPageData = {
  mode: TodayMode;
  examId: string | null;
  overview: TodayOverview;
  nextStep: TodayNextStep;
  sessionPlan: TodaySessionPlan;
  latestMock: TodayLatestMock;
  subjectInsights: TodaySubjectInsightsSection;
  equationBook: TodayEquationBook;
  mistakeBook: TodayMistakeBook;
  nextMock: TodayNextMock;
  perspective: TodayPerspective;
  footerRight: string;
};
