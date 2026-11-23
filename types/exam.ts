/** Active paper counts for the mocks hub chips. */
export interface ApiExamPaperCounts {
  chapterWise: number;
  fullMocks: number;
  /** Backend key; shown in the UI as "Rapid Rounds" (cosmetic rename). */
  sprint: number;
}

/** Exam card shown in the by-category hub listing. */
export interface ApiExam {
  id: string;
  title: string;
  /** Preferred description for the hub card body. */
  description: string;
  /** Optional exam/category icon URL for the hub avatar. */
  imageUrl: string;
  /** Legacy alias of description. */
  fullName: string;
  /** Human-readable duration (e.g. "3h 20min"); null when the exam has none. */
  duration: string | null;
  totalQuestions: number | null;
  totalMarks: number | null;
  /** Server-built stats row, e.g. `180 QUESTIONS · 180 MINUTES · …`. */
  statsLabel: string;
  testsCount: number;
  paperCounts: ApiExamPaperCounts;
  subjectsCount: number;
  /** Nearby exam or one with many sign-ups. Absent means not trending. */
  trending: boolean;
}

export interface ApiExamCategory {
  id: string;
  name: string;
  shortName: string;
  imageUrl: string;
  description: string;
  exams: ApiExam[];
}

export interface ApiCategoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiExamsByCategoryPage {
  categories: ApiExamCategory[];
  pagination: ApiCategoryPagination;
}

export interface ApiExamSubject {
  /** Subject id. */
  subject: string;
  name?: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
  hasNegativeMarking: boolean;
  negativeMarksPerQuestion: number;
  sessionTime?: number;
}

export interface ApiExamPerformanceBand {
  key: string;
  minPercent: number;
}

export interface ApiExamDetail {
  id: string;
  name: string;
  description?: string;
  /** Duration in minutes. */
  duration?: number;
  totalQuestions?: number;
  totalMarks?: number;
  subjects?: ApiExamSubject[];
  isSessionWise: boolean;
  hasMultiLingualSupport: boolean;
  isActive: boolean;
  performanceBands?: ApiExamPerformanceBand[];
}

export interface ApiSubjectTopic {
  id: string;
  name: string;
}

/** Subject on an exam, with topics for chapter-wise filters. */
export interface ApiSubjectForExam {
  id: string;
  name: string;
  description?: string;
  topics: ApiSubjectTopic[];
}
