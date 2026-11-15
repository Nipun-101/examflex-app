export type AnalysisOutlookTone = "stretch" | "explore";

export type AnalysisPathway = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: AnalysisOutlookTone;
};

export type AnalysisPerformance = {
  label: string;
  score: number;
  maxScore: number;
  scoreHint: string;
  editLabel: string;
};

export type AnalysisDisclaimer = {
  title: string;
  body: string;
};

export type AnalysisPageData = {
  title: string;
  tagline: string;
  examBadge: string;
  outlookLabel: string;
  performance: AnalysisPerformance;
  sectionTitle: string;
  sectionSubtitle: string;
  pathways: readonly AnalysisPathway[];
  disclaimer: AnalysisDisclaimer;
  cutoffLabel: string;
  cutoffHref: string;
};
