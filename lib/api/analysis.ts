import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readNumberOrNull,
  readString,
} from "@/lib/api/parse-fields";
import { buildQueryString, requestParsed } from "@/lib/api/request";
import type {
  AnalysisEngagement,
  AnalysisFullMockAttempt,
  AnalysisFullMocksSection,
  AnalysisLatestFullMock,
  AnalysisOverview,
  AnalysisPathway,
  AnalysisPathwayBand,
  AnalysisPathwayStatus,
  AnalysisPathwaysSection,
  AnalysisSubjectInsight,
  AnalysisSubjectsSection,
  AnalysisTopicInsight,
} from "@/types/analysis";

function parseBand(value: unknown): AnalysisPathwayBand | null {
  if (value === "below" || value === "borderline" || value === "comfortable") {
    return value;
  }
  return null;
}

function parseStatus(value: unknown): AnalysisPathwayStatus | null {
  if (
    value === "NO_ATTEMPTS" ||
    value === "NO_CUTOFF" ||
    value === "EVALUATED"
  ) {
    return value;
  }
  return null;
}

function parseStrength(
  value: unknown
): AnalysisSubjectInsight["strengthLabel"] | null {
  if (value === "Strong" || value === "Good" || value === "Weak") {
    return value;
  }
  return null;
}

function parseFullMockAttempt(value: unknown): AnalysisFullMockAttempt | null {
  if (!isApiRecord(value)) return null;
  const attemptId = readString(value.attemptId);
  const label = readString(value.label);
  const title = readString(value.title);
  const score = readNumber(value.score);
  const maxScore = readNumber(value.maxScore);
  const percent = readNumber(value.percent);
  const submittedAt = readString(value.submittedAt);
  if (
    !attemptId ||
    !label ||
    !title ||
    score === undefined ||
    maxScore === undefined ||
    percent === undefined ||
    !submittedAt
  ) {
    return null;
  }
  return { attemptId, label, title, score, maxScore, percent, submittedAt };
}

function parseLatest(value: unknown): AnalysisLatestFullMock | null {
  if (value === null) return null;
  if (!isApiRecord(value)) return null;
  const attemptId = readString(value.attemptId);
  const title = readString(value.title);
  const score = readNumber(value.score);
  const maxScore = readNumber(value.maxScore);
  const percent = readNumber(value.percent);
  const submittedAt = readString(value.submittedAt);
  if (
    !attemptId ||
    !title ||
    score === undefined ||
    maxScore === undefined ||
    percent === undefined ||
    !submittedAt
  ) {
    return null;
  }
  return {
    attemptId,
    title,
    score,
    maxScore,
    percent,
    submittedAt,
    deltaFromPrevious: readNumberOrNull(value.deltaFromPrevious),
    ...optionalField("correctCount", readNumber(value.correctCount)),
    ...optionalField("incorrectCount", readNumber(value.incorrectCount)),
    ...optionalField("skippedCount", readNumber(value.skippedCount)),
  };
}

function parsePathway(value: unknown): AnalysisPathway | null {
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const title = readString(value.title);
  const minPercent = readNumber(value.minPercent);
  const comfortPercent = readNumber(value.comfortPercent);
  const progress01 = readNumber(value.progress01);
  const band = parseBand(value.band);
  const message = readString(value.message);
  if (
    !id ||
    !title ||
    minPercent === undefined ||
    comfortPercent === undefined ||
    progress01 === undefined ||
    !band ||
    !message
  ) {
    return null;
  }
  const userPercent = readNumberOrNull(value.userPercent);
  // Older API payloads have no status: no percent means no attempts yet.
  const status =
    parseStatus(value.status) ??
    (userPercent === null ? "NO_ATTEMPTS" : "EVALUATED");
  const attemptsConsidered = readNumber(value.attemptsConsidered) ?? 0;
  return {
    id,
    title,
    status,
    yourMarks: readNumberOrNull(value.yourMarks),
    cutoffMarks: readNumberOrNull(value.cutoffMarks),
    comfortMarks: readNumberOrNull(value.comfortMarks),
    gapMarks: readNumberOrNull(value.gapMarks),
    maxMarks: readNumberOrNull(value.maxMarks),
    attemptsConsidered,
    attemptsInWindow: readNumber(value.attemptsInWindow) ?? attemptsConsidered,
    minPercent,
    comfortPercent,
    userPercent,
    progress01,
    band,
    message,
    ...optionalField("subtitle", readString(value.subtitle)),
  };
}

function parseTopic(value: unknown): AnalysisTopicInsight | null {
  if (!isApiRecord(value)) return null;
  const topicId = readString(value.topicId);
  const topicName = readString(value.topicName);
  const attemptCount = readNumber(value.attemptCount);
  const averagePercent = readNumber(value.averagePercent);
  if (
    !topicId ||
    !topicName ||
    attemptCount === undefined ||
    averagePercent === undefined ||
    typeof value.isWeak !== "boolean" ||
    typeof value.isStrong !== "boolean"
  ) {
    return null;
  }
  return {
    topicId,
    topicName,
    attemptCount,
    averagePercent,
    isWeak: value.isWeak,
    isStrong: value.isStrong,
  };
}

function parseSubject(value: unknown): AnalysisSubjectInsight | null {
  if (!isApiRecord(value)) return null;
  const subjectId = readString(value.subjectId);
  const subjectName = readString(value.subjectName);
  const attemptCount = readNumber(value.attemptCount);
  const averagePercent = readNumber(value.averagePercent);
  const strengthLabel = parseStrength(value.strengthLabel);
  const topics = parseList(value.topics, parseTopic);
  if (
    !subjectId ||
    !subjectName ||
    attemptCount === undefined ||
    averagePercent === undefined ||
    !strengthLabel ||
    !topics
  ) {
    return null;
  }
  return {
    subjectId,
    subjectName,
    attemptCount,
    averagePercent,
    strengthLabel,
    topics,
    ...optionalField("tip", readString(value.tip)),
  };
}

function parseFullMocks(value: unknown): AnalysisFullMocksSection | null {
  if (!isApiRecord(value)) return null;
  const completedCount = readNumber(value.completedCount);
  const targetCount = readNumber(value.targetCount);
  const recent = parseList(value.recent, parseFullMockAttempt);
  if (
    completedCount === undefined ||
    targetCount === undefined ||
    typeof value.needsMoreAttempts !== "boolean" ||
    !recent
  ) {
    return null;
  }
  const latest =
    value.latest === null || value.latest === undefined
      ? null
      : parseLatest(value.latest);
  if (value.latest != null && latest === null) return null;
  return {
    completedCount,
    targetCount,
    needsMoreAttempts: value.needsMoreAttempts,
    latest,
    recent,
  };
}

function parsePathways(value: unknown): AnalysisPathwaysSection | null {
  if (!isApiRecord(value)) return null;
  const attemptCountUsed = readNumber(value.attemptCountUsed);
  const offerings = parseList(value.offerings, parsePathway);
  if (attemptCountUsed === undefined || !offerings) return null;
  return {
    averagePercent: readNumberOrNull(value.averagePercent),
    attemptCountUsed,
    offerings,
  };
}

function parseSubjects(value: unknown): AnalysisSubjectsSection | null {
  if (!isApiRecord(value)) return null;
  if (value.source !== "TOPIC_WISE") return null;
  const attemptCount = readNumber(value.attemptCount);
  const items = parseList(value.items, parseSubject);
  if (
    attemptCount === undefined ||
    typeof value.needsMoreAttempts !== "boolean" ||
    !items
  ) {
    return null;
  }
  return {
    source: "TOPIC_WISE",
    attemptCount,
    needsMoreAttempts: value.needsMoreAttempts,
    items,
  };
}

function parseEngagement(value: unknown): AnalysisEngagement | null {
  if (!isApiRecord(value)) return null;
  const fullMockTarget = readNumber(value.fullMockTarget);
  const fullMocksRemaining = readNumber(value.fullMocksRemaining);
  if (
    typeof value.hasFullMocks !== "boolean" ||
    typeof value.hasChapterWise !== "boolean" ||
    fullMockTarget === undefined ||
    fullMocksRemaining === undefined
  ) {
    return null;
  }
  return {
    hasFullMocks: value.hasFullMocks,
    hasChapterWise: value.hasChapterWise,
    fullMockTarget,
    fullMocksRemaining,
  };
}

/** Parse `GET /analysis/overview` data. */
export function parseAnalysisOverview(value: unknown): AnalysisOverview | null {
  if (!isApiRecord(value)) return null;
  if (!isApiRecord(value.exam)) return null;
  const examId = readString(value.exam.id);
  const examName = readString(value.exam.name);
  if (!examId || !examName) return null;

  const fullMocks = parseFullMocks(value.fullMocks);
  const pathways = parsePathways(value.pathways);
  const subjects = parseSubjects(value.subjects);
  const engagement = parseEngagement(value.engagement);
  if (!fullMocks || !pathways || !subjects || !engagement) return null;

  return {
    exam: {
      id: examId,
      name: examName,
      ...optionalField("totalMarks", readNumber(value.exam.totalMarks)),
    },
    fullMocks,
    pathways,
    subjects,
    engagement,
  };
}

export async function getAnalysisOverview(
  examId: string
): Promise<ApiResult<AnalysisOverview>> {
  const query = buildQueryString({ examId });
  return requestParsed(
    `/api/v1/analysis/overview${query}`,
    { method: "GET" },
    (data) => parseAnalysisOverview(data),
    "Could not load analysis. Please try again."
  );
}
