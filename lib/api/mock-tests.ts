import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import { optionalField, readString } from "@/lib/api/parse-fields";
import {
  parsePaginatedList,
  parsePaperExamRef,
  parsePaperListBase,
} from "@/lib/api/paper-list";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type {
  ApiMockTest,
  ApiMockTestSubject,
  ApiMockTestTopic,
  GetMockTestsByExamParams,
  PaginatedList,
} from "@/types/mock-test";

function parseIdName(
  value: unknown
): ApiMockTestSubject | ApiMockTestTopic | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  return { id: value.id, name: value.name };
}

/** Parse one chapter-wise (TOPIC_WISE) paper list item. */
export function parseMockTest(value: unknown): ApiMockTest | null {
  if (!isApiRecord(value)) return null;
  const base = parsePaperListBase(value);
  const exam = parsePaperExamRef(value.exam);
  const subject = parseIdName(value.subject);
  if (!base || !exam || !subject) return null;
  const topic = parseIdName(value.topic);
  return {
    ...base,
    exam,
    subject,
    generationMode: readString(value.generationMode) ?? "",
    ...optionalField("topic", topic ?? undefined),
  };
}

/** Parse `{ data, pagination }` from `GET /mock-tests/exam/:examId`. */
export function parseMockTestsPage(
  raw: unknown
): PaginatedList<ApiMockTest> | null {
  return parsePaginatedList(raw, parseMockTest);
}

/** Chapter-wise papers for an exam (TOPIC_WISE; "Chapter Wise" in the UI). */
export async function getMockTestsByExam(
  examId: string,
  params: GetMockTestsByExamParams = {}
): Promise<ApiResult<PaginatedList<ApiMockTest>>> {
  const query = buildQueryString({
    page: params.page,
    limit: params.limit,
    search: params.search,
    subjectId: params.subjectId,
  });
  return requestParsed(
    `/api/v1/mock-tests/exam/${encodeURIComponent(examId)}${query}`,
    { method: "GET" },
    (_data, raw) => parseMockTestsPage(raw),
    "Could not load chapter-wise tests. Please try again."
  );
}
