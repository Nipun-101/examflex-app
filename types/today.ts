export type TodayNextStep = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  aside: string;
};

export type TodaySessionStep = {
  index: string;
  label: string;
};

export type TodaySessionPlan = {
  eyebrow: string;
  title: string;
  steps: readonly TodaySessionStep[];
};

export type TodayMockAttempt = {
  id: string;
  label: string;
  score: number;
};

export type TodayLatestMock = {
  title: string;
  meta: string;
  score: number;
  maxScore: number;
  deltaLabel: string;
  breakdown: string;
  attempts: readonly TodayMockAttempt[];
};

export type TodaySubjectInsight = {
  subject: string;
  scoreLabel: string;
  tip: string;
};

export type TodayEquationBook = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
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
};

export type TodayPageData = {
  eyebrow: string;
  headline: string;
  subhead: string;
  paceBadge: string;
  nextStep: TodayNextStep;
  sessionPlan: TodaySessionPlan;
  latestMock: TodayLatestMock;
  subjectInsights: readonly TodaySubjectInsight[];
  equationBook: TodayEquationBook;
  nextMock: TodayNextMock;
  perspective: TodayPerspective;
  footerRight: string;
};
