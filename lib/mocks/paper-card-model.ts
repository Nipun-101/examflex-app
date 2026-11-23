import type { PaperAccessFields } from "@/types/access";
import type {
  ApiFullMockTest,
  ApiMockTest,
  ApiSprintTest,
  AttemptSummary,
  PaperListItemBase,
} from "@/types/mock-test";
import { effectiveAttemptAction } from "@/lib/mocks/paper-card-action";

export type PaperCardStatus = "new" | "in_progress" | "completed";

export type PaperCardKind = "chapter" | "full" | "sprint";

/** One shape for chapter-wise, full mock and sprint cards. */
export type PaperCardData = PaperAccessFields & {
  id: string;
  title: string;
  /** @deprecated Prefer `eyebrow`; kept for older call sites/tests. */
  subtitle: string | null;
  eyebrow: string;
  kind: PaperCardKind;
  subjectName: string | null;
  topicName: string | null;
  totalQuestions: number;
  durationInMinutes: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarking: number;
  allowRetake: boolean;
  status: PaperCardStatus;
  answeredCount?: number;
  timeRemainingSeconds?: number;
  attemptCount: number;
  bestScore?: number;
  bestCorrectAnswers?: number;
  lastAttemptId?: string;
  lastScore?: number;
  lastTimeTakenSeconds?: number;
  lastIncorrectAnswers?: number;
  mistakeBookRemaining?: number;
};

export const UNTITLED_PAPER = "Untitled paper";

export function resolvePaperCardStatus(
  paper: PaperAccessFields
): PaperCardStatus {
  const action = effectiveAttemptAction(paper);
  if (action === "RESUME") return "in_progress";
  if (action === "RETAKE") return "completed";
  return "new";
}

export function resolveTotalMarks(paper: PaperListItemBase): number {
  if (typeof paper.totalMarks === "number" && Number.isFinite(paper.totalMarks)) {
    return paper.totalMarks;
  }
  return paper.totalQuestions * paper.marksPerQuestion;
}

function pickAccessFields(paper: PaperAccessFields): PaperAccessFields {
  return {
    ...(paper.accessMode ? { accessMode: paper.accessMode } : {}),
    ...(paper.access ? { access: paper.access } : {}),
    ...(paper.userAttemptAction
      ? { userAttemptAction: paper.userAttemptAction }
      : {}),
    ...(paper.resumeAttemptId
      ? { resumeAttemptId: paper.resumeAttemptId }
      : {}),
  };
}

function pickSummaryFields(summary: AttemptSummary | undefined): Pick<
  PaperCardData,
  | "answeredCount"
  | "timeRemainingSeconds"
  | "attemptCount"
  | "bestScore"
  | "bestCorrectAnswers"
  | "lastAttemptId"
  | "lastScore"
  | "lastTimeTakenSeconds"
  | "lastIncorrectAnswers"
  | "mistakeBookRemaining"
> {
  return {
    attemptCount: summary?.attemptCount ?? 0,
    ...(summary?.answeredCount !== undefined
      ? { answeredCount: summary.answeredCount }
      : {}),
    ...(summary?.timeRemainingSeconds !== undefined
      ? { timeRemainingSeconds: summary.timeRemainingSeconds }
      : {}),
    ...(summary?.bestScore !== undefined ? { bestScore: summary.bestScore } : {}),
    ...(summary?.bestCorrectAnswers !== undefined
      ? { bestCorrectAnswers: summary.bestCorrectAnswers }
      : {}),
    ...(summary?.lastAttemptId
      ? { lastAttemptId: summary.lastAttemptId }
      : {}),
    ...(summary?.lastScore !== undefined ? { lastScore: summary.lastScore } : {}),
    ...(summary?.lastTimeTakenSeconds !== undefined
      ? { lastTimeTakenSeconds: summary.lastTimeTakenSeconds }
      : {}),
    ...(summary?.lastIncorrectAnswers !== undefined
      ? { lastIncorrectAnswers: summary.lastIncorrectAnswers }
      : {}),
    ...(summary?.mistakeBookRemaining !== undefined
      ? { mistakeBookRemaining: summary.mistakeBookRemaining }
      : {}),
  };
}

function toCardData(
  paper: PaperListItemBase,
  options: {
    title: string;
    subtitle: string | null;
    eyebrow: string;
    kind: PaperCardKind;
    subjectName: string | null;
    topicName: string | null;
  }
): PaperCardData {
  return {
    ...pickAccessFields(paper),
    ...pickSummaryFields(paper.attemptSummary),
    id: paper.id,
    title: options.title,
    subtitle: options.subtitle,
    eyebrow: options.eyebrow,
    kind: options.kind,
    subjectName: options.subjectName,
    topicName: options.topicName,
    totalQuestions: paper.totalQuestions,
    durationInMinutes: paper.durationInMinutes,
    totalMarks: resolveTotalMarks(paper),
    marksPerQuestion: paper.marksPerQuestion,
    negativeMarking: paper.negativeMarking,
    allowRetake: paper.allowRetake,
    status: resolvePaperCardStatus(paper),
  };
}

function chapterEyebrow(subjectName: string, topicName?: string): string {
  return [subjectName, topicName]
    .filter((part): part is string => Boolean(part))
    .join(" · ")
    .toUpperCase();
}

/** Chapter Wise (TOPIC_WISE) card. */
export function chapterPaperToCard(paper: ApiMockTest): PaperCardData {
  const title = paper.title || paper.topic?.name || paper.subject.name;
  const subtitle = [paper.subject.name, paper.topic?.name]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  return toCardData(paper, {
    title,
    subtitle,
    eyebrow: chapterEyebrow(paper.subject.name, paper.topic?.name),
    kind: "chapter",
    subjectName: paper.subject.name,
    topicName: paper.topic?.name ?? null,
  });
}

export function fullMockToCard(paper: ApiFullMockTest): PaperCardData {
  const title = paper.title || paper.exam?.name || UNTITLED_PAPER;
  return toCardData(paper, {
    title,
    subtitle: paper.isSessionWise ? "Session-wise" : "Full paper",
    eyebrow: "FULL MOCK",
    kind: "full",
    subjectName: null,
    topicName: null,
  });
}

/**
 * Maps a backend sprint test to a card. UI name is "Rapid Round(s)" (cosmetic
 * rename only); the API type / endpoint stay `SPRINT` / `sprint-tests`.
 */
export function sprintTestToCard(paper: ApiSprintTest): PaperCardData {
  const title = paper.title || paper.exam?.name || UNTITLED_PAPER;
  return toCardData(paper, {
    title,
    // Cosmetic rename: backend SPRINT papers are displayed as "Rapid Round".
    // `kind: "sprint"` is an internal key and intentionally unchanged.
    subtitle: "Rapid Round",
    eyebrow: "RAPID ROUND",
    kind: "sprint",
    subjectName: null,
    topicName: null,
  });
}
