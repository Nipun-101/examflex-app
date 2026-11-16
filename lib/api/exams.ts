import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readNumberOrNull,
  readString,
  readStringOrNull,
} from "@/lib/api/parse-fields";
import { parsePagination } from "@/lib/api/paper-list";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type {
  ApiCategoryPagination,
  ApiExam,
  ApiExamCategory,
  ApiExamDetail,
  ApiExamPaperCounts,
  ApiExamPerformanceBand,
  ApiExamSubject,
  ApiExamsByCategoryPage,
  ApiSubjectForExam,
  ApiSubjectTopic,
} from "@/types/exam";

function parsePaperCounts(value: unknown): ApiExamPaperCounts {
  if (!isApiRecord(value)) {
    return { chapterWise: 0, fullMocks: 0, sprint: 0 };
  }
  return {
    chapterWise: readNumber(value.chapterWise) ?? 0,
    fullMocks: readNumber(value.fullMocks) ?? 0,
    sprint: readNumber(value.sprint) ?? 0,
  };
}

/** Parse one exam card from `GET /exams/by-category`. */
export function parseExam(value: unknown): ApiExam | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }
  const description =
    readString(value.description) ?? readString(value.fullName) ?? "";
  const paperCounts = parsePaperCounts(value.paperCounts);
  const testsCount = readNumber(value.testsCount) ?? paperCounts.chapterWise;
  return {
    id: value.id,
    title: value.title,
    description,
    imageUrl: readString(value.imageUrl) ?? "",
    fullName: readString(value.fullName) ?? description,
    duration: readStringOrNull(value.duration),
    totalQuestions: readNumberOrNull(value.totalQuestions),
    totalMarks: readNumberOrNull(value.totalMarks),
    statsLabel:
      readString(value.statsLabel) ?? "Practice papers available",
    testsCount,
    paperCounts,
    subjectsCount: readNumber(value.subjectsCount) ?? 0,
    trending: value.trending === true,
  };
}

export function parseExamCategory(value: unknown): ApiExamCategory | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    shortName: readString(value.shortName) ?? "",
    imageUrl: readString(value.imageUrl) ?? "",
    description: readString(value.description) ?? "",
    exams: parseList(value.exams, parseExam) ?? [],
  };
}

/** Parse the `data` array of `GET /exams/by-category`. */
export function parseExamsByCategory(value: unknown): ApiExamCategory[] | null {
  return parseList(value, parseExamCategory);
}

export function parseExamsByCategoryPage(
  data: unknown,
  raw: unknown
): ApiExamsByCategoryPage | null {
  const categories = parseExamsByCategory(data);
  if (!categories || !isApiRecord(raw)) return null;
  const pagination = parsePagination(raw.pagination) as ApiCategoryPagination | null;
  if (!pagination) return null;
  return { categories, pagination };
}

function parseExamSubject(value: unknown): ApiExamSubject | null {
  if (!isApiRecord(value)) return null;
  const numberOfQuestions = readNumber(value.numberOfQuestions);
  const marksPerQuestion = readNumber(value.marksPerQuestion);
  if (
    typeof value.subject !== "string" ||
    numberOfQuestions === undefined ||
    marksPerQuestion === undefined
  ) {
    return null;
  }
  return {
    subject: value.subject,
    numberOfQuestions,
    marksPerQuestion,
    hasNegativeMarking: value.hasNegativeMarking === true,
    negativeMarksPerQuestion: readNumber(value.negativeMarksPerQuestion) ?? 0,
    ...optionalField("name", readString(value.name)),
    ...optionalField("sessionTime", readNumber(value.sessionTime)),
  };
}

function parsePerformanceBand(value: unknown): ApiExamPerformanceBand | null {
  if (!isApiRecord(value)) return null;
  const minPercent = readNumber(value.minPercent);
  if (typeof value.key !== "string" || minPercent === undefined) return null;
  return { key: value.key, minPercent };
}

function parseSubjectTopic(value: unknown): ApiSubjectTopic | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  return { id: value.id, name: value.name };
}

export function parseSubjectForExam(value: unknown): ApiSubjectForExam | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    topics: parseList(value.topics, parseSubjectTopic) ?? [],
    ...optionalField("description", readString(value.description)),
  };
}

export function parseSubjectsForExam(
  value: unknown
): ApiSubjectForExam[] | null {
  return parseList(value, parseSubjectForExam);
}

/** Parse the `data` object of `GET /exams/:id`. */
export function parseExamDetail(value: unknown): ApiExamDetail | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  const subjects = parseList(value.subjects, parseExamSubject);
  const performanceBands = parseList(
    value.performanceBands,
    parsePerformanceBand
  );
  return {
    id: value.id,
    name: value.name,
    isSessionWise: value.isSessionWise === true,
    hasMultiLingualSupport: value.hasMultiLingualSupport === true,
    isActive: value.isActive === true,
    ...optionalField("description", readString(value.description)),
    ...optionalField("duration", readNumber(value.duration)),
    ...optionalField("totalQuestions", readNumber(value.totalQuestions)),
    ...optionalField("totalMarks", readNumber(value.totalMarks)),
    ...optionalField("subjects", subjects ?? undefined),
    ...optionalField("performanceBands", performanceBands ?? undefined),
  };
}

export type GetExamsByCategoryParams = {
  page?: number;
  limit?: number;
};

/** Paginated exams grouped by category for the mocks hub. */
export async function getExamsByCategory(
  params: GetExamsByCategoryParams = {}
): Promise<ApiResult<ApiExamsByCategoryPage>> {
  const query = buildQueryString({
    page: params.page ?? 1,
    limit: params.limit ?? 1,
  });
  return requestParsed(
    `/api/v1/exams/by-category${query}`,
    { method: "GET" },
    parseExamsByCategoryPage,
    "Could not load exams. Please try again."
  );
}

export async function getExamById(
  examId: string
): Promise<ApiResult<ApiExamDetail>> {
  return requestParsed(
    `/api/v1/exams/${encodeURIComponent(examId)}`,
    { method: "GET" },
    parseExamDetail,
    "Could not load this exam. Please try again."
  );
}

/** Exam-scoped subjects with topics for chapter-wise filters. */
export async function getSubjectsForExam(
  examId: string
): Promise<ApiResult<ApiSubjectForExam[]>> {
  return requestParsed(
    `/api/v1/subjects/exam/${encodeURIComponent(examId)}`,
    { method: "GET" },
    parseSubjectsForExam,
    "Could not load subjects for this exam. Please try again."
  );
}
