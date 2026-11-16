import type { PaperAccessFields } from "@/types/access";

/**
 * API paper types. TOPIC_WISE papers are labeled "Chapter Wise" in the UI,
 * FULL_EXAM "Full Mocks" and SPRINT "Sprint Tests".
 */
export type PaperType = "TOPIC_WISE" | "FULL_EXAM" | "SPRINT";

export interface MockTestsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedList<T> {
  data: T[];
  pagination: MockTestsPagination;
}

/** Fields common to chapter-wise, full mock and sprint list items. */
export interface PaperListItemBase extends PaperAccessFields {
  id: string;
  title: string | null;
  description: string | null;
  totalQuestions: number;
  durationInMinutes: number;
  marksPerQuestion: number;
  negativeMarking: number;
  passingScore: number | null;
  allowRetake: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPaperExamRef {
  id: string;
  name: string;
  description?: string;
}

export interface ApiMockTestSubject {
  id: string;
  name: string;
}

export interface ApiMockTestTopic {
  id: string;
  name: string;
}

/** Chapter-wise (TOPIC_WISE) paper. */
export interface ApiMockTest extends PaperListItemBase {
  exam: ApiPaperExamRef;
  subject: ApiMockTestSubject;
  topic?: ApiMockTestTopic;
  generationMode: string;
}

export interface ApiFullMockSubjectConfig {
  subject: string;
  name: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
  hasNegativeMarking: boolean;
  negativeMarksPerQuestion: number;
  sessionTime?: number;
  questionStartIndex: number;
  questionEndIndex: number;
}

export interface ApiFullMockTest extends PaperListItemBase {
  totalMarks?: number;
  isSessionWise: boolean;
  exam: ApiPaperExamRef | null;
  subjectConfig: ApiFullMockSubjectConfig[];
}

export interface ApiSprintTest extends PaperListItemBase {
  exam: ApiPaperExamRef | null;
}

export interface GetMockTestsByExamParams {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
}

export interface GetFullMockTestsParams {
  examId?: string;
  page?: number;
  limit?: number;
}

export interface GetSprintTestsParams {
  examId: string;
  page?: number;
  limit?: number;
}
