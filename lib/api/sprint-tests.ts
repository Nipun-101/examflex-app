import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import {
  parsePaginatedList,
  parsePaperExamRef,
  parsePaperListBase,
} from "@/lib/api/paper-list";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type {
  ApiSprintTest,
  GetSprintTestsParams,
  PaginatedList,
} from "@/types/mock-test";

/**
 * COSMETIC RENAME NOTE: the UI calls these "Rapid Rounds", but the backend
 * contract is unchanged — endpoint `/api/v1/sprint-tests`, paper type `SPRINT`.
 * Do NOT rename this client, its types or the endpoint.
 */

/** Parse one sprint (SPRINT) paper list item. */
export function parseApiSprintTest(value: unknown): ApiSprintTest | null {
  if (!isApiRecord(value)) return null;
  const base = parsePaperListBase(value);
  if (!base) return null;
  return { ...base, exam: parsePaperExamRef(value.exam) };
}

/** Parse `{ data, pagination }` from `GET /sprint-tests`. */
export function parseSprintTestsPage(
  raw: unknown
): PaginatedList<ApiSprintTest> | null {
  return parsePaginatedList(raw, parseApiSprintTest);
}

export async function getSprintTests(
  params: GetSprintTestsParams
): Promise<ApiResult<PaginatedList<ApiSprintTest>>> {
  const query = buildQueryString({
    examId: params.examId,
    page: params.page,
    limit: params.limit,
  });
  return requestParsed(
    `/api/v1/sprint-tests${query}`,
    { method: "GET" },
    (_data, raw) => parseSprintTestsPage(raw),
    "Could not load Rapid Rounds. Please try again."
  );
}
