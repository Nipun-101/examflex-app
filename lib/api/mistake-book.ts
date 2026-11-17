import { isApiRecord } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readString,
  readStringList,
} from "@/lib/api/parse-fields";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type { ApiResult } from "@/lib/api/parse-envelope";
import type { MockTestsPagination } from "@/types/mock-test";
import type {
  MistakeBookListSummary,
  MistakeBookSession,
  MistakeBookSessionDetail,
  MistakeBookSessionsPage,
  MistakeBookStartWith,
  MistakeBookSubjectCount,
  MistakeChapterOption,
  MistakeItem,
  MistakeKind,
  MistakePaperType,
  MistakeSubjectOption,
  MistakeTripReason,
} from "@/types/mistake-book";
import { parsePagination } from "@/lib/api/paper-list";

const MISTAKE_BOOK_PATH = "/api/v1/mistake-book";

const PAPER_TYPES: readonly MistakePaperType[] = [
  "TOPIC_WISE",
  "FULL_EXAM",
  "SPRINT",
];
const KINDS: readonly MistakeKind[] = ["incorrect", "unattended"];
const TRIP_REASONS: readonly MistakeTripReason[] = [
  "concept-gap",
  "calculation",
  "time",
];

function parsePaperType(value: unknown): MistakePaperType | undefined {
  return PAPER_TYPES.find((type) => type === value);
}

function parseKind(value: unknown): MistakeKind | undefined {
  return KINDS.find((kind) => kind === value);
}

function parseTripReason(value: unknown): MistakeTripReason | undefined {
  return TRIP_REASONS.find((reason) => reason === value);
}

function parseIsoDate(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  return undefined;
}

export function parseMistakeBookSession(
  value: unknown
): MistakeBookSession | null {
  if (!isApiRecord(value)) return null;
  const mockTestId = readString(value.mockTestId);
  const attemptId = readString(value.attemptId);
  const title = readString(value.title);
  const paperType = parsePaperType(value.paperType);
  const remainingCount = readNumber(value.remainingCount);
  const attemptSubmittedAt = parseIsoDate(value.attemptSubmittedAt);
  if (
    !mockTestId ||
    !attemptId ||
    !title ||
    !paperType ||
    remainingCount === undefined ||
    !attemptSubmittedAt
  ) {
    return null;
  }

  const subjectIds = readStringList(value.subjectIds) ?? [];

  return {
    mockTestId,
    attemptId,
    title,
    paperType,
    remainingCount,
    attemptSubmittedAt,
    subjectIds,
    ...optionalField("subjectId", readString(value.subjectId)),
    ...optionalField("subjectLabel", readString(value.subjectLabel)),
    ...optionalField("topicId", readString(value.topicId)),
    ...optionalField("topicLabel", readString(value.topicLabel)),
  };
}

function parseSubjectCount(value: unknown): MistakeBookSubjectCount | null {
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const label = readString(value.label);
  const count = readNumber(value.count);
  if (!id || !label || count === undefined) return null;
  return { id, label, count };
}

function parseStartWith(value: unknown): MistakeBookStartWith | null {
  if (value === null) return null;
  if (!isApiRecord(value)) return null;
  const mockTestId = readString(value.mockTestId);
  const title = readString(value.title);
  if (!mockTestId || !title) return null;
  return { mockTestId, title };
}

function parseSubjectOption(value: unknown): MistakeSubjectOption | null {
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const label = readString(value.label);
  if (!id || !label) return null;
  return { id, label };
}

function parseChapterOption(value: unknown): MistakeChapterOption | null {
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const label = readString(value.label);
  const subjectId = readString(value.subjectId);
  if (!id || !label || !subjectId) return null;
  return { id, label, subjectId };
}

export function parseMistakeBookListSummary(
  value: unknown
): MistakeBookListSummary | null {
  if (!isApiRecord(value)) return null;
  const totalMistakes = readNumber(value.totalMistakes);
  const sessionCount = readNumber(value.sessionCount);
  const bySubject = parseList(value.bySubject, parseSubjectCount);
  const subjects = parseList(value.subjects, parseSubjectOption);
  const chapters = parseList(value.chapters, parseChapterOption);
  if (
    totalMistakes === undefined ||
    sessionCount === undefined ||
    !bySubject ||
    !subjects ||
    !chapters
  ) {
    return null;
  }
  const base = {
    totalMistakes,
    sessionCount,
    bySubject,
    subjects,
    chapters,
  };
  if (value.startWith !== null && value.startWith !== undefined) {
    const startWith = parseStartWith(value.startWith);
    if (!startWith) return null;
    return { ...base, startWith };
  }
  return { ...base, startWith: null };
}

export function parseMistakeItem(value: unknown): MistakeItem | null {
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const kind = parseKind(value.kind);
  const subjectId = readString(value.subjectId);
  const subjectLabel = readString(value.subjectLabel);
  const questionNumber = readString(value.questionNumber);
  const prompt = readString(value.prompt);
  const correctAnswerLabel = readString(value.correctAnswerLabel);
  const correctAnswer = readString(value.correctAnswer);
  const insightTitle = readString(value.insightTitle);
  const insightBody = readString(value.insightBody);
  const insightFormula = readString(value.insightFormula) ?? "";
  const sourceLabel = readString(value.sourceLabel) ?? "";
  const sourceHref = readString(value.sourceHref) ?? "";
  const sourceHint = readString(value.sourceHint) ?? "";
  const tripReason = parseTripReason(value.tripReason);
  const topicId = readString(value.topicId) ?? "";

  if (
    !id ||
    !kind ||
    !subjectId ||
    !subjectLabel ||
    !questionNumber ||
    prompt === undefined ||
    !correctAnswerLabel ||
    correctAnswer === undefined ||
    !insightTitle ||
    insightBody === undefined ||
    !tripReason
  ) {
    return null;
  }

  return {
    id,
    kind,
    subjectId,
    subjectLabel,
    chapterId: topicId,
    questionNumber,
    prompt,
    correctAnswerLabel,
    correctAnswer,
    insightTitle,
    insightBody,
    insightFormula,
    sourceLabel,
    sourceHref,
    sourceHint,
    tripReason,
    ...optionalField("examTimeLabel", readString(value.examTimeLabel)),
    ...optionalField("imageUrl", readString(value.imageUrl)),
    ...optionalField("yourAnswerLabel", readString(value.yourAnswerLabel)),
    ...optionalField("yourAnswer", readString(value.yourAnswer)),
  };
}

export function parseMistakeBookSessionDetail(
  value: unknown
): MistakeBookSessionDetail | null {
  if (!isApiRecord(value)) return null;
  const mockTestId = readString(value.mockTestId);
  const attemptId = readString(value.attemptId);
  const title = readString(value.title);
  const paperType = parsePaperType(value.paperType);
  const remainingCount = readNumber(value.remainingCount);
  const attemptSubmittedAt = parseIsoDate(value.attemptSubmittedAt);
  if (
    !mockTestId ||
    !attemptId ||
    !title ||
    !paperType ||
    remainingCount === undefined ||
    !attemptSubmittedAt
  ) {
    return null;
  }

  const subjects = parseList(value.subjects, parseSubjectOption);
  const chapters = parseList(value.chapters, parseChapterOption);
  const entries = parseList(value.entries, parseMistakeItem);
  if (!subjects || !chapters || !entries) return null;

  return {
    mockTestId,
    attemptId,
    title,
    paperType,
    remainingCount,
    attemptSubmittedAt,
    subjects,
    chapters,
    entries,
  };
}

function parseSessionsPage(
  data: unknown,
  raw: unknown
): MistakeBookSessionsPage | null {
  const sessions = parseList(data, parseMistakeBookSession);
  if (!sessions || !isApiRecord(raw)) return null;
  const pagination = parsePagination(raw.pagination);
  const summary = parseMistakeBookListSummary(raw.summary);
  if (!pagination || !summary) return null;
  return { data: sessions, pagination, summary };
}

export async function listMistakeBookSessions(options?: {
  page?: number;
  limit?: number;
  subjectId?: string;
  topicId?: string;
}): Promise<ApiResult<MistakeBookSessionsPage>> {
  const query = buildQueryString({
    page: options?.page,
    limit: options?.limit,
    subjectId: options?.subjectId,
    topicId: options?.topicId,
  });
  return requestParsed(
    `${MISTAKE_BOOK_PATH}/sessions${query}`,
    { method: "GET" },
    parseSessionsPage,
    "Could not load your Mistake Book. Please try again."
  );
}

export async function getMistakeBookSession(
  mockTestId: string,
  filters?: { subjectId?: string; topicId?: string }
): Promise<ApiResult<MistakeBookSessionDetail>> {
  const query = buildQueryString({
    subjectId: filters?.subjectId,
    topicId: filters?.topicId,
  });
  return requestParsed(
    `${MISTAKE_BOOK_PATH}/sessions/${encodeURIComponent(mockTestId)}${query}`,
    { method: "GET" },
    (data) => parseMistakeBookSessionDetail(data),
    "Could not load this Mistake Book session. Please try again."
  );
}

export async function patchMistakeTripReason(
  entryId: string,
  tripReason: MistakeTripReason
): Promise<ApiResult<undefined>> {
  return requestParsed(
    `${MISTAKE_BOOK_PATH}/entries/${encodeURIComponent(entryId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ tripReason }),
    },
    () => undefined,
    "Could not save that tag. Please try again."
  );
}

export async function deleteMistakeBookEntry(
  entryId: string
): Promise<ApiResult<undefined>> {
  return requestParsed(
    `${MISTAKE_BOOK_PATH}/entries/${encodeURIComponent(entryId)}`,
    { method: "DELETE" },
    () => undefined,
    "Could not remove this question. Please try again."
  );
}

export type { MockTestsPagination };
