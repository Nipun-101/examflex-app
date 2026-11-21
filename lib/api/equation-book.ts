import { isApiRecord } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readBoolean,
  readString,
  readStringList,
} from "@/lib/api/parse-fields";
import { parsePagination } from "@/lib/api/paper-list";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type { ApiResult } from "@/lib/api/parse-envelope";
import type {
  EquationItem,
  EquationListPage,
  EquationNamedRef,
} from "@/types/equation-book";

const EQUATION_BOOK_PATH = "/api/v1/equation-book";

/** The API sends null / omits the field when there is no picture. */
function readImageUrl(value: unknown): string | undefined {
  const url = readString(value);
  return url && url.trim() ? url : undefined;
}

function parseNamedRef(value: unknown): EquationNamedRef | null {
  if (typeof value === "string" && value.trim()) {
    return { id: value, name: value };
  }
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const name = readString(value.name);
  if (!id || !name) return null;
  return { id, name };
}

export function parseEquationItem(value: unknown): EquationItem | null {
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const title = readString(value.title);
  const shortDescription = readString(value.shortDescription);
  const equation = readString(value.equation);
  const subject = parseNamedRef(value.subject);
  const topic = parseNamedRef(value.topic);
  const exams = parseList(value.exams, parseNamedRef) ?? [];
  if (
    !id ||
    !title ||
    !shortDescription ||
    !equation ||
    !subject ||
    !topic ||
    exams.length === 0
  ) {
    return null;
  }

  return {
    id,
    title,
    shortDescription,
    equation,
    bulletPoints: readStringList(value.bulletPoints) ?? [],
    subject,
    topic,
    exams,
    isActive: readBoolean(value.isActive) ?? true,
    ...optionalField("longDescription", readString(value.longDescription)),
    ...optionalField("mnemonic", readString(value.mnemonic)),
    ...optionalField("imageUrl", readImageUrl(value.imageUrl)),
    ...optionalField("createdAt", readString(value.createdAt)),
    ...optionalField("updatedAt", readString(value.updatedAt)),
  };
}

function parseEquationListPage(
  data: unknown,
  raw: unknown
): EquationListPage | null {
  const items = parseList(data, parseEquationItem);
  if (!items || !isApiRecord(raw)) return null;
  const pagination = parsePagination(raw.pagination);
  if (!pagination) return null;
  return { items, pagination };
}

export type ListEquationsParams = {
  page?: number;
  limit?: number;
  examId?: string;
  subjectId?: string;
  topicId?: string;
  search?: string;
};

export async function listEquations(
  params: ListEquationsParams = {}
): Promise<ApiResult<EquationListPage>> {
  const query = buildQueryString({
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    examId: params.examId,
    subjectId: params.subjectId,
    topicId: params.topicId,
    search: params.search,
  });
  return requestParsed(
    `${EQUATION_BOOK_PATH}${query}`,
    { method: "GET" },
    parseEquationListPage,
    "Could not load equations. Please try again."
  );
}

export async function getEquation(
  id: string
): Promise<ApiResult<EquationItem>> {
  return requestParsed(
    `${EQUATION_BOOK_PATH}/${encodeURIComponent(id)}`,
    { method: "GET" },
    (data) => parseEquationItem(data),
    "Could not load this equation. Please try again."
  );
}
