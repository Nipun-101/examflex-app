export type MistakeSubjectId = "all" | "physics" | "chemistry" | "biology";

export type MistakeTripReason = "concept-gap" | "calculation" | "time";

export type MistakeSubjectOption = {
  id: MistakeSubjectId;
  label: string;
};

export type MistakeChapterOption = {
  id: string;
  label: string;
  subjectId: Exclude<MistakeSubjectId, "all">;
};

export type MistakeItem = {
  id: string;
  subjectId: Exclude<MistakeSubjectId, "all">;
  subjectLabel: string;
  chapterId: string;
  questionNumber: string;
  examTimeLabel: string;
  prompt: string;
  yourAnswerLabel: string;
  yourAnswer: string;
  correctAnswerLabel: string;
  correctAnswer: string;
  insightTitle: string;
  insightBody: string;
  insightFormula: string;
  sourceLabel: string;
  sourceHref: string;
  sourceHint: string;
  defaultTripReason: MistakeTripReason;
};

export type MistakeTripOption = {
  id: MistakeTripReason;
  label: string;
};

export type MistakeBookPageData = {
  title: string;
  examBadge: string;
  mockLabel: string;
  subjects: readonly MistakeSubjectOption[];
  chapters: readonly MistakeChapterOption[];
  tripReasons: readonly MistakeTripOption[];
  mistakes: readonly MistakeItem[];
  understoodLabel: string;
  understoodHint: string;
  timerLabel: string;
  timerHint: string;
  tripPrompt: string;
};
