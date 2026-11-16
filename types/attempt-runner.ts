/** Palette state for one question in the attempt runner (client-only). */
export type QuestionStatus =
  | "not-visited"
  | "not-answered"
  | "answered"
  | "marked"
  | "marked-answered";

export interface QuestionStatusSummary {
  total: number;
  answered: number;
  notAnswered: number;
  marked: number;
  notVisited: number;
}

/** Per-section tallies shown on the results screen. */
export interface SectionBreakdown {
  order: number;
  name: string;
  questionIds: string[];
  correct: number;
  wrong: number;
  skipped: number;
  timeConsumed: number;
}
