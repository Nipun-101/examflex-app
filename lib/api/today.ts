import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readString,
} from "@/lib/api/parse-fields";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type {
  TodayEquationBook,
  TodayLatestMock,
  TodayMistakeBook,
  TodayMockAttempt,
  TodayMode,
  TodayNextMock,
  TodayNextStep,
  TodayOverview,
  TodayPageData,
  TodayPerspective,
  TodaySessionPlan,
  TodaySessionStep,
  TodaySessionStepState,
  TodaySubjectInsight,
  TodaySubjectInsightsSection,
} from "@/types/today";

function parseMode(value: unknown): TodayMode | null {
  if (value === "empty" || value === "active") return value;
  return null;
}

function parseStepState(value: unknown): TodaySessionStepState | null {
  if (value === "active" || value === "locked" || value === "done") {
    return value;
  }
  return null;
}

/** Require `string | null` (rejects missing / wrong types). */
function requireStringOrNull(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value === "string") return value;
  return undefined;
}

function requireNumberOrNull(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

function parseOverview(value: unknown): TodayOverview | null {
  if (!isApiRecord(value)) return null;
  const eyebrow = readString(value.eyebrow);
  const headline = readString(value.headline);
  const subhead = readString(value.subhead);
  const paceBadge = readString(value.paceBadge);
  if (!eyebrow || !headline || !subhead || !paceBadge) return null;
  return { eyebrow, headline, subhead, paceBadge };
}

function parseNextStep(value: unknown): TodayNextStep | null {
  if (!isApiRecord(value)) return null;
  const eyebrow = readString(value.eyebrow);
  const title = readString(value.title);
  const body = readString(value.body);
  const ctaLabel = readString(value.ctaLabel);
  const ctaHref = readString(value.ctaHref);
  const aside = readString(value.aside);
  if (
    !eyebrow ||
    !title ||
    !body ||
    !ctaLabel ||
    !ctaHref ||
    !aside ||
    typeof value.showPath !== "boolean"
  ) {
    return null;
  }
  return {
    eyebrow,
    title,
    body,
    ctaLabel,
    ctaHref,
    aside,
    showPath: value.showPath,
  };
}

function parseSessionStep(value: unknown): TodaySessionStep | null {
  if (!isApiRecord(value)) return null;
  const index = readString(value.index);
  const label = readString(value.label);
  const state = parseStepState(value.state);
  if (!index || !label || !state) return null;
  return { index, label, state };
}

function parseSessionPlan(value: unknown): TodaySessionPlan | null {
  if (!isApiRecord(value)) return null;
  const eyebrow = readString(value.eyebrow);
  const title = readString(value.title);
  const steps = parseList(value.steps, parseSessionStep);
  if (!eyebrow || !title || steps === null || steps.length === 0) return null;
  return { eyebrow, title, steps };
}

function parseAttempt(value: unknown): TodayMockAttempt | null {
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const label = readString(value.label);
  const score = requireNumberOrNull(value.score);
  if (!id || !label || score === undefined) return null;
  return { id, label, score };
}

function parseLatestMock(value: unknown): TodayLatestMock | null {
  if (!isApiRecord(value)) return null;
  const title = readString(value.title);
  const meta = readString(value.meta);
  const maxScore = readNumber(value.maxScore);
  const score = requireNumberOrNull(value.score);
  const deltaLabel = requireStringOrNull(value.deltaLabel);
  const breakdown = requireStringOrNull(value.breakdown);
  const placeholderMessage = requireStringOrNull(value.placeholderMessage);
  const attempts = parseList(value.attempts, parseAttempt);
  if (
    !title ||
    !meta ||
    maxScore === undefined ||
    score === undefined ||
    deltaLabel === undefined ||
    breakdown === undefined ||
    placeholderMessage === undefined ||
    attempts === null
  ) {
    return null;
  }

  return {
    title,
    meta,
    score,
    maxScore,
    deltaLabel,
    breakdown,
    placeholderMessage,
    attempts,
  };
}

function parseSubjectInsight(value: unknown): TodaySubjectInsight | null {
  if (!isApiRecord(value)) return null;
  const subject = readString(value.subject);
  const scoreLabel = readString(value.scoreLabel);
  const tip = readString(value.tip);
  const averagePercent = requireNumberOrNull(value.averagePercent);
  if (
    !subject ||
    scoreLabel === undefined ||
    tip === undefined ||
    averagePercent === undefined
  ) {
    return null;
  }
  return { subject, scoreLabel, tip, averagePercent };
}

function parseSubjectInsights(
  value: unknown
): TodaySubjectInsightsSection | null {
  if (!isApiRecord(value)) return null;
  const title = readString(value.title);
  const subhead = requireStringOrNull(value.subhead);
  const items = parseList(value.items, parseSubjectInsight);
  if (!title || subhead === undefined || items === null) return null;
  return { title, subhead, items };
}

function parsePromoBook(value: unknown): TodayEquationBook | null {
  if (!isApiRecord(value)) return null;
  const eyebrow = readString(value.eyebrow);
  const title = readString(value.title);
  const body = readString(value.body);
  const ctaLabel = readString(value.ctaLabel);
  const ctaHref = readString(value.ctaHref);
  const statusPill = requireStringOrNull(value.statusPill);
  if (
    !eyebrow ||
    !title ||
    !body ||
    !ctaLabel ||
    !ctaHref ||
    statusPill === undefined
  ) {
    return null;
  }
  return { eyebrow, title, body, ctaLabel, ctaHref, statusPill };
}

function parseEquationBook(value: unknown): TodayEquationBook | null {
  return parsePromoBook(value);
}

function parseMistakeBook(value: unknown): TodayMistakeBook | null {
  return parsePromoBook(value);
}

function parseNextMock(value: unknown): TodayNextMock | null {
  if (!isApiRecord(value)) return null;
  const eyebrow = readString(value.eyebrow);
  const title = readString(value.title);
  const meta = readString(value.meta);
  const ctaLabel = readString(value.ctaLabel);
  const ctaHref = readString(value.ctaHref);
  if (!eyebrow || !title || !meta || !ctaLabel || !ctaHref) return null;
  return { eyebrow, title, meta, ctaLabel, ctaHref };
}

function parsePerspective(value: unknown): TodayPerspective | null {
  if (!isApiRecord(value)) return null;
  const eyebrow = readString(value.eyebrow);
  const title = readString(value.title);
  const body = readString(value.body);
  const ctaLabel = readString(value.ctaLabel);
  const ctaHref = readString(value.ctaHref);
  if (
    !eyebrow ||
    !title ||
    !body ||
    !ctaLabel ||
    !ctaHref ||
    typeof value.locked !== "boolean"
  ) {
    return null;
  }
  return { eyebrow, title, body, ctaLabel, ctaHref, locked: value.locked };
}

export function parseTodayPageData(value: unknown): TodayPageData | null {
  if (!isApiRecord(value)) return null;
  const mode = parseMode(value.mode);
  const examId = readString(value.examId);
  const overview = parseOverview(value.overview);
  const nextStep = parseNextStep(value.nextStep);
  const sessionPlan = parseSessionPlan(value.sessionPlan);
  const latestMock = parseLatestMock(value.latestMock);
  const subjectInsights = parseSubjectInsights(value.subjectInsights);
  const equationBook = parseEquationBook(value.equationBook);
  const mistakeBook = parseMistakeBook(value.mistakeBook);
  const nextMock = parseNextMock(value.nextMock);
  const perspective = parsePerspective(value.perspective);
  const footerRight = readString(value.footerRight);

  if (
    !mode ||
    !examId ||
    !overview ||
    !nextStep ||
    !sessionPlan ||
    !latestMock ||
    !subjectInsights ||
    !equationBook ||
    !mistakeBook ||
    !nextMock ||
    !perspective ||
    !footerRight
  ) {
    return null;
  }

  return {
    mode,
    examId,
    overview,
    nextStep,
    sessionPlan,
    latestMock,
    subjectInsights,
    equationBook,
    mistakeBook,
    nextMock,
    perspective,
    footerRight,
  };
}

export async function getToday(
  examId: string
): Promise<ApiResult<TodayPageData>> {
  const query = buildQueryString({ ...optionalField("examId", examId) });
  return requestParsed(
    `/api/v1/today${query}`,
    { method: "GET" },
    (data) => parseTodayPageData(data),
    "Could not load your Today dashboard."
  );
}
