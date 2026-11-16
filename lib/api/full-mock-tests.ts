import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readString,
} from "@/lib/api/parse-fields";
import {
  parsePaginatedList,
  parsePaperExamRef,
  parsePaperListBase,
} from "@/lib/api/paper-list";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type {
  ApiFullMockSubjectConfig,
  ApiFullMockTest,
  GetFullMockTestsParams,
  PaginatedList,
} from "@/types/mock-test";

function parseSubjectConfig(value: unknown): ApiFullMockSubjectConfig | null {
  if (!isApiRecord(value)) return null;
  const numberOfQuestions = readNumber(value.numberOfQuestions);
  const marksPerQuestion = readNumber(value.marksPerQuestion);
  const questionStartIndex = readNumber(value.questionStartIndex);
  const questionEndIndex = readNumber(value.questionEndIndex);
  if (
    typeof value.subject !== "string" ||
    numberOfQuestions === undefined ||
    marksPerQuestion === undefined ||
    questionStartIndex === undefined ||
    questionEndIndex === undefined
  ) {
    return null;
  }
  return {
    subject: value.subject,
    name: readString(value.name) ?? "",
    numberOfQuestions,
    marksPerQuestion,
    hasNegativeMarking: value.hasNegativeMarking === true,
    negativeMarksPerQuestion: readNumber(value.negativeMarksPerQuestion) ?? 0,
    questionStartIndex,
    questionEndIndex,
    ...optionalField("sessionTime", readNumber(value.sessionTime)),
  };
}

/** Parse one full mock (FULL_EXAM) paper list item. */
export function parseApiFullMockTest(value: unknown): ApiFullMockTest | null {
  if (!isApiRecord(value)) return null;
  const base = parsePaperListBase(value);
  if (!base) return null;
  return {
    ...base,
    exam: parsePaperExamRef(value.exam),
    isSessionWise: value.isSessionWise === true,
    subjectConfig: parseList(value.subjectConfig, parseSubjectConfig) ?? [],
    ...optionalField("totalMarks", readNumber(value.totalMarks)),
  };
}

/** Parse `{ data, pagination }` from `GET /full-mock-tests`. */
export function parseFullMockTestsPage(
  raw: unknown
): PaginatedList<ApiFullMockTest> | null {
  return parsePaginatedList(raw, parseApiFullMockTest);
}

export async function getFullMockTests(
  params: GetFullMockTestsParams = {}
): Promise<ApiResult<PaginatedList<ApiFullMockTest>>> {
  const query = buildQueryString({
    examId: params.examId,
    page: params.page,
    limit: params.limit,
  });
  return requestParsed(
    `/api/v1/full-mock-tests${query}`,
    { method: "GET" },
    (_data, raw) => parseFullMockTestsPage(raw),
    "Could not load full mocks. Please try again."
  );
}
