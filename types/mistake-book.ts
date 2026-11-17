export type MistakeTripReason = "concept-gap" | "calculation" | "time";

export type MistakeKind = "incorrect" | "unattended";

export type MistakePaperType = "TOPIC_WISE" | "FULL_EXAM" | "SPRINT";

/** Subject filter id; `"all"` means no subject filter. */
export type MistakeSubjectFilterId = "all" | string;

export type MistakeSubjectOption = {
  id: MistakeSubjectFilterId;
  label: string;
};

export type MistakeChapterOption = {
  id: string;
  label: string;
  subjectId: string;
};

export type MistakeItem = {
  id: string;
  kind: MistakeKind;
  subjectId: string;
  subjectLabel: string;
  chapterId: string;
  questionNumber: string;
  /** Omitted until per-question exam timing exists. */
  examTimeLabel?: string;
  prompt: string;
  /** Presigned stem figure URL when the question includes an image. */
  imageUrl?: string;
  yourAnswerLabel?: string;
  yourAnswer?: string;
  correctAnswerLabel: string;
  correctAnswer: string;
  insightTitle: string;
  insightBody: string;
  insightFormula: string;
  sourceLabel: string;
  sourceHref: string;
  sourceHint: string;
  tripReason: MistakeTripReason;
};

export type MistakeTripOption = {
  id: MistakeTripReason;
  label: string;
};

export type MistakeBookSession = {
  mockTestId: string;
  attemptId: string;
  title: string;
  paperType: MistakePaperType;
  remainingCount: number;
  attemptSubmittedAt: string;
  subjectId?: string;
  subjectLabel?: string;
  topicId?: string;
  topicLabel?: string;
};

export type MistakeBookSessionDetail = {
  mockTestId: string;
  attemptId: string;
  title: string;
  paperType: MistakePaperType;
  remainingCount: number;
  attemptSubmittedAt: string;
  subjects: readonly MistakeSubjectOption[];
  chapters: readonly MistakeChapterOption[];
  entries: readonly MistakeItem[];
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

export const MISTAKE_TRIP_OPTIONS: readonly MistakeTripOption[] = [
  { id: "concept-gap", label: "Concept gap" },
  { id: "calculation", label: "Calculation" },
  { id: "time", label: "Time" },
] as const;

export const MISTAKE_BOOK_COPY = {
  title: "Mistake Book",
  examBadge: "examflex",
  understoodLabel: "Understood · remove from book",
  understoodHint: "Removes this question from your Mistake Book.",
  timerLabel: "Review time · optional",
  timerHint:
    "Track time spent understanding this mistake. Start when reviewing; stop when it clicks.",
  tripPrompt: "What tripped you up?",
  unattendedHint: "You didn’t choose any.",
  railGenericMockLabel: "This mock",
  sessionsTip:
    "Wrong answers and questions you left blank both land here — clear them when the idea sticks.",
} as const;
