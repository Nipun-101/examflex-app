import { apiFetch } from "@/lib/api/client";
import type { ApiResult } from "@/lib/api/parse-envelope";
import {
  parseAttemptDetails,
  parseCompleteSessionResult,
  parsePauseAttemptData,
  parseResumeAttemptData,
  parseStartAttemptData,
  parseSubmitAttemptResult,
} from "@/lib/api/parse-attempt";
import { optionalField } from "@/lib/api/parse-fields";
import { requestParsed } from "@/lib/api/request";
import type {
  AttemptAnswerInput,
  AttemptDetails,
  CompleteSessionResult,
  PauseAttemptData,
  ResumeAttemptData,
  StartAttemptData,
  SubmitAttemptResult,
} from "@/types/attempt";

const ATTEMPTS_PATH = "/api/v1/mock-test-attempts";

function attemptApiPath(attemptId: string, suffix = ""): string {
  return `${ATTEMPTS_PATH}/${encodeURIComponent(attemptId)}${suffix}`;
}

/** Start an attempt for any paper type (chapter-wise, full mock or sprint). */
export async function startMockTestAttempt(
  mockTestId: string
): Promise<ApiResult<StartAttemptData>> {
  return requestParsed(
    `${ATTEMPTS_PATH}/start`,
    { method: "POST", body: JSON.stringify({ mockTestId }) },
    parseStartAttemptData,
    "Could not start this test. Please try again."
  );
}

/** A null `selectedOptionId` clears the answer, so the question scores as unanswered. */
export async function patchAttemptAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string | null
): Promise<ApiResult<undefined>> {
  return requestParsed(
    attemptApiPath(attemptId, "/answer"),
    {
      method: "PATCH",
      body: JSON.stringify({ questionId, selectedOptionId }),
    },
    () => undefined,
    "Could not save your answer. Please try again."
  );
}

export async function pauseAttempt(
  attemptId: string
): Promise<ApiResult<PauseAttemptData>> {
  return requestParsed(
    attemptApiPath(attemptId, "/pause"),
    { method: "POST" },
    parsePauseAttemptData,
    "Could not pause this test. Please try again."
  );
}

export async function resumeAttempt(
  attemptId: string
): Promise<ApiResult<ResumeAttemptData>> {
  return requestParsed(
    attemptApiPath(attemptId, "/resume"),
    { method: "GET" },
    parseResumeAttemptData,
    "Could not resume this test. Please try again."
  );
}

export async function submitAttempt(
  attemptId: string,
  answers: AttemptAnswerInput[]
): Promise<ApiResult<SubmitAttemptResult>> {
  return requestParsed(
    attemptApiPath(attemptId, "/submit"),
    { method: "POST", body: JSON.stringify({ answers }) },
    parseSubmitAttemptResult,
    "Could not submit this test. Please try again."
  );
}

/** Finish the current section of a session-wise paper. */
export async function completeSession(
  attemptId: string
): Promise<ApiResult<CompleteSessionResult>> {
  return requestParsed(
    attemptApiPath(attemptId, "/sessions/complete"),
    { method: "POST" },
    parseCompleteSessionResult,
    "Could not complete this section. Please try again."
  );
}

/** Authoritative attempt state or results (does not unpause the attempt). */
export async function getAttempt(
  attemptId: string
): Promise<ApiResult<AttemptDetails>> {
  return requestParsed(
    attemptApiPath(attemptId),
    { method: "GET" },
    parseAttemptDetails,
    "Could not load this attempt. Please try again."
  );
}

/**
 * Fire-and-forget pause for page unload. Uses keepalive so the request can
 * outlive the document.
 */
export function pauseAttemptKeepalive(attemptId: string): void {
  void apiFetch(attemptApiPath(attemptId, "/pause"), {
    method: "POST",
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * Shape GET /:attemptId like start/resume so the runner can render without
 * unpausing (unlike the resume endpoint).
 */
export function attemptDetailsToRunnerData(
  details: AttemptDetails
): StartAttemptData {
  const isSessionWise =
    details.isSessionWise ?? details.test.isSessionWise;
  const sessions = details.sessions ?? details.test.sessions;
  const currentSessionIndex =
    details.currentSessionIndex ?? details.test.currentSessionIndex;

  return {
    attemptId: details.attemptId,
    mockTestData: {
      title: details.test.title,
      durationInMinutes: details.test.durationInMinutes,
      totalQuestions: details.test.totalQuestions,
      startedAt: details.test.startedAt,
      marksPerQuestion: details.test.marksPerQuestion,
      negativeMarking: details.test.negativeMarking,
      passingScore: details.test.passingScore,
      exam: details.test.exam,
      ...optionalField("paperType", details.test.paperType),
      ...optionalField("subject", details.test.subject),
      ...optionalField("topic", details.test.topic),
      ...optionalField("isSessionWise", isSessionWise),
      ...optionalField("sessions", sessions),
      ...optionalField("currentSessionIndex", currentSessionIndex),
    },
    questions: details.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      subject: q.subject,
      selectedOption: q.selectedOption ?? null,
      ...optionalField("optionType", q.optionType),
      ...optionalField("topic", q.topic),
      ...optionalField("sessionOrder", q.sessionOrder),
    })),
  };
}
