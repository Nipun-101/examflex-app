import { isApiRecord } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readString,
  readStringOrNull,
} from "@/lib/api/parse-fields";
import type {
  AccessMode,
  PaperAccess,
  UserAttemptAction,
} from "@/types/access";
import type {
  ApiPaperExamRef,
  MockTestsPagination,
  PaginatedList,
  PaperListItemBase,
} from "@/types/mock-test";

const ACCESS_MODES: readonly AccessMode[] = ["FREE", "ENTITLED"];
const ATTEMPT_ACTIONS: readonly UserAttemptAction[] = [
  "START",
  "RETAKE",
  "RESUME",
];

export function parseAccessMode(value: unknown): AccessMode | undefined {
  return ACCESS_MODES.find((mode) => mode === value);
}

export function parseUserAttemptAction(
  value: unknown
): UserAttemptAction | undefined {
  return ATTEMPT_ACTIONS.find((action) => action === value);
}

/** Missing or malformed access means the client does not lock the paper. */
export function parsePaperAccess(value: unknown): PaperAccess | undefined {
  if (!isApiRecord(value)) return undefined;
  if (typeof value.allowed !== "boolean") return undefined;
  return { allowed: value.allowed, reason: readString(value.reason) ?? "" };
}

export function parsePagination(value: unknown): MockTestsPagination | null {
  if (!isApiRecord(value)) return null;
  const total = readNumber(value.total);
  const page = readNumber(value.page);
  const limit = readNumber(value.limit);
  const totalPages = readNumber(value.totalPages);
  const { hasNextPage, hasPrevPage } = value;
  if (
    total === undefined ||
    page === undefined ||
    limit === undefined ||
    totalPages === undefined ||
    typeof hasNextPage !== "boolean" ||
    typeof hasPrevPage !== "boolean"
  ) {
    return null;
  }
  return { total, page, limit, totalPages, hasNextPage, hasPrevPage };
}

/** `{ id, name, description? }` exam ref on paper list items. */
export function parsePaperExamRef(value: unknown): ApiPaperExamRef | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    ...optionalField("description", readString(value.description)),
  };
}

/** Fields shared by chapter-wise, full mock and sprint list items. */
export function parsePaperListBase(
  value: Record<string, unknown>
): PaperListItemBase | null {
  const action = parseUserAttemptAction(value.userAttemptAction);
  const totalQuestions = readNumber(value.totalQuestions);
  const durationInMinutes = readNumber(value.durationInMinutes);
  const marksPerQuestion = readNumber(value.marksPerQuestion);
  const negativeMarking = readNumber(value.negativeMarking);

  if (
    typeof value.id !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    totalQuestions === undefined ||
    durationInMinutes === undefined ||
    marksPerQuestion === undefined ||
    negativeMarking === undefined ||
    typeof value.allowRetake !== "boolean" ||
    typeof value.shuffleOptions !== "boolean" ||
    typeof value.showResultsImmediately !== "boolean" ||
    typeof value.isActive !== "boolean"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: readStringOrNull(value.title),
    description: readStringOrNull(value.description),
    totalQuestions,
    durationInMinutes,
    marksPerQuestion,
    negativeMarking,
    passingScore: readNumber(value.passingScore) ?? null,
    allowRetake: value.allowRetake,
    shuffleOptions: value.shuffleOptions,
    showResultsImmediately: value.showResultsImmediately,
    isActive: value.isActive,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    ...optionalField("accessMode", parseAccessMode(value.accessMode)),
    ...optionalField("access", parsePaperAccess(value.access)),
    ...optionalField("userAttemptAction", action),
    ...optionalField("resumeAttemptId", readString(value.resumeAttemptId)),
  };
}

/**
 * Parse `{ data: T[], pagination }`. Invalid items are dropped; a missing
 * array or pagination block fails the whole response.
 */
export function parsePaginatedList<T>(
  raw: unknown,
  parseItem: (item: unknown) => T | null
): PaginatedList<T> | null {
  if (!isApiRecord(raw)) return null;
  const data = parseList(raw.data, parseItem);
  const pagination = parsePagination(raw.pagination);
  if (!data || !pagination) return null;
  return { data, pagination };
}
