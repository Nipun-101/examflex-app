/** Exam card shown in the by-category hub listing. */
export interface ApiExam {
  id: string;
  title: string;
  fullName: string;
  /** Human-readable duration (e.g. "3h 20min"); null when the exam has none. */
  duration: string | null;
  totalQuestions: number | null;
  totalMarks: number | null;
  testsCount: number;
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
