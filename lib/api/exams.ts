import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readNumberOrNull,
  readString,
  readStringOrNull,
} from "@/lib/api/parse-fields";
import { requestParsed } from "@/lib/api/request";
import type {
  ApiExam,
  ApiExamCategory,
  ApiExamDetail,
  ApiExamPerformanceBand,
  ApiExamSubject,
} from "@/types/exam";

/** Parse one exam card from `GET /exams/by-category`. */
export function parseExam(value: unknown): ApiExam | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }
  return {
    id: value.id,
    title: value.title,
    fullName: readString(value.fullName) ?? "",
    duration: readStringOrNull(value.duration),
    totalQuestions: readNumberOrNull(value.totalQuestions),
    totalMarks: readNumberOrNull(value.totalMarks),
    testsCount: readNumber(value.testsCount) ?? 0,
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

/** Central exams grouped by category (state / scope params are not used in v1). */
export async function getExamsByCategory(): Promise<
  ApiResult<ApiExamCategory[]>
> {
  return requestParsed(
    "/api/v1/exams/by-category",
    { method: "GET" },
    parseExamsByCategory,
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
