"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Flag, LayoutGrid, X } from "lucide-react";
import { useStudyRouter } from "@/hooks/use-study-router";
import { AttemptErrorState } from "@/components/attempt/attempt-error-state";
import { AttemptHeader } from "@/components/attempt/attempt-header";
import { AttemptModal } from "@/components/attempt/attempt-modal";
import { ExitDialog } from "@/components/attempt/exit-dialog";
import { MathpixBoundary } from "@/components/attempt/mathpix-boundary";
import { PauseOverlay } from "@/components/attempt/pause-overlay";
import { QuestionPalette } from "@/components/attempt/question-palette";
import { QuestionPanel } from "@/components/attempt/question-panel";
import { SubmitDialog } from "@/components/attempt/submit-dialog";
import { StudyButton, StudyControlLink } from "@/components/study/study-button";
import { useAttemptGuards } from "@/hooks/use-attempt-guards";
import { useStudyRouteLoading } from "@/hooks/use-study-route-loading";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import { useCountdown } from "@/hooks/use-countdown";
import {
  completeSession,
  patchAttemptAnswer,
  pauseAttempt,
  resumeAttempt,
  submitAttempt,
} from "@/lib/api/attempts";
import {
  attemptExitHref,
  attemptExitLabel,
  attemptSectionLabel,
  attemptTitle,
} from "@/lib/mocks/attempt-meta";
import {
  getCurrentSession,
  hydrateAnswers,
  isLastSession,
  mergeAnswers,
  visibleAttemptQuestions,
} from "@/lib/mocks/attempt-sessions";
import { clearCachedAttempt, cacheAttempt } from "@/lib/mocks/attempt-storage";
import {
  paperConsumedSeconds,
  runningConsumedSeconds,
  timerDurationSeconds,
} from "@/lib/mocks/attempt-time";
import {
  clampZoomIndex,
  DEFAULT_QUESTION_ZOOM_INDEX,
} from "@/lib/mocks/question-zoom";
import {
  deriveQuestionStatuses,
  summarizeStatuses,
} from "@/lib/mocks/question-status";
import {
  mockTestDataFromResume,
  resumeSessionIndex,
  resumeSessionIsOpen,
} from "@/lib/mocks/resume-payload";
import type {
  AttemptLanguage,
  AttemptMockTestData,
  AttemptQuestion,
  CompleteSessionResult,
  ResumeAttemptData,
} from "@/types/attempt";

type MockTestRunnerProps = {
  attemptId: string;
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
  initialSecondsLeft: number;
  initialPaused?: boolean;
  /**
   * Called once after a successful submit (or final section). Guards are
   * already disarmed, so the parent can navigate to results freely.
   */
  onFinished: (language: AttemptLanguage) => void;
};

const SECTION_ERROR = "Could not complete this section. Please try again.";
const ACTION_BUTTON =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] px-4 text-sm font-semibold";

export function MockTestRunner({
  attemptId,
  mockTestData: initialMockTestData,
  questions: initialQuestions,
  initialSecondsLeft,
  initialPaused = false,
  onFinished,
}: MockTestRunnerProps) {
  const router = useStudyRouter();

  const [mockTestData, setMockTestData] =
    useState<AttemptMockTestData>(initialMockTestData);
  const [questions, setQuestions] =
    useState<AttemptQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(() =>
    hydrateAnswers(initialQuestions),
  );
  // Mark-for-review and visited are client-only; the API only knows answers.
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));

  const [language, setLanguage] = useState<AttemptLanguage>("en");
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_QUESTION_ZOOM_INDEX);

  const [isPaused, setIsPaused] = useState(initialPaused);
  const [pausedConsumed, setPausedConsumed] = useState<number | null>(null);
  const [pausedTotalConsumed, setPausedTotalConsumed] = useState<number | null>(
    null,
  );
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [showSubmit, setShowSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completingLabel, setCompletingLabel] = useState(
    "Submitting your test...",
  );
  useStudyRouteLoading(isSubmitting, {
    holdKey: STUDY_LOADING_HOLD.submit,
    label: completingLabel,
  });

  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { disarm } = useAttemptGuards({
    attemptId,
    onBackTrap: () => setShowExit(true),
  });

  const { secondsLeft, reset: resetCountdown } = useCountdown(
    initialSecondsLeft,
    {
      paused: isPaused || isSubmitting,
      onExpire: () => handleConfirmSubmit(),
    },
  );

  const isSessionWise = Boolean(mockTestData.isSessionWise);
  const activeSession = getCurrentSession(mockTestData);
  const visibleQuestions = visibleAttemptQuestions(questions, mockTestData);
  const totalQuestions = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentIndex];
  const lastSession = isLastSession(mockTestData);
  const submitLabel =
    isSessionWise && !lastSession ? "Next Section" : "Submit Test";

  const exitHref = attemptExitHref(mockTestData);
  const exitLabel = attemptExitLabel(mockTestData);
  const title = attemptTitle(mockTestData);
  const sectionLabel = attemptSectionLabel(mockTestData, activeSession);

  const statuses = deriveQuestionStatuses(
    visibleQuestions,
    answers,
    marked,
    visited,
  );
  const summary = summarizeStatuses(statuses);

  const consumed = runningConsumedSeconds(
    timerDurationSeconds(mockTestData),
    secondsLeft,
    pausedConsumed,
  );
  const paperConsumed = paperConsumedSeconds(
    mockTestData,
    consumed,
    pausedTotalConsumed,
  );

  function goTo(index: number) {
    if (index < 0 || index >= totalQuestions) return;
    setCurrentIndex(index);
    setVisited((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  }

  function saveAnswer(questionId: string, optionId: string | null) {
    setAnswers((prev) => {
      const next = new Map(prev);
      if (optionId === null) next.delete(questionId);
      else next.set(questionId, optionId);
      return next;
    });
    void patchAttemptAnswer(attemptId, questionId, optionId).then((result) => {
      if (!result.ok) {
        setNotice(
          "We couldn't sync your last answer. It will be saved when you submit.",
        );
      }
    });
  }

  function applyResumePayload(data: ResumeAttemptData) {
    setMockTestData(mockTestDataFromResume(data));
    setQuestions(data.questions);
    resetCountdown(data.timeRemaining);
    setAnswers((prev) => mergeAnswers(prev, data.questions));
    setCurrentIndex(0);
    setVisited(new Set([0]));
    setIsPaused(false);
    setPausedConsumed(null);
    setPausedTotalConsumed(null);
    cacheAttempt(data);
  }

  async function handlePause() {
    if (isPausing) return;
    setIsPausing(true);
    setNotice(null);
    const result = await pauseAttempt(attemptId);
    setIsPausing(false);
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    resetCountdown(result.data.timeRemaining);
    setPausedConsumed(result.data.timeConsumed);
    setPausedTotalConsumed(
      result.data.totalTimeConsumed ?? result.data.timeConsumed,
    );
    setIsPaused(true);
    setMobilePaletteOpen(false);
    // The cached payload still holds a running clock; drop it so a reload
    // reads the paused state from the server instead.
    clearCachedAttempt(attemptId);
  }

  async function handleResume() {
    if (isResuming) return;
    setIsResuming(true);
    setResumeError(null);
    const result = await resumeAttempt(attemptId);
    setIsResuming(false);
    if (!result.ok) {
      setResumeError(result.message);
      return;
    }
    applyResumePayload(result.data);
  }

  function finish() {
    disarm();
    clearCachedAttempt(attemptId);
    onFinished(language);
  }

  function failSubmit(message: string) {
    setSubmitError(message);
    setShowSubmit(true);
    setIsSubmitting(false);
  }

  async function handleSubmitPaper() {
    if (isPaused) return;
    setShowSubmit(false);
    setIsSubmitting(true);
    setCompletingLabel("Submitting your test...");
    setSubmitError(null);
    const result = await submitAttempt(
      attemptId,
      Array.from(answers.entries()).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })),
    );
    if (!result.ok) {
      failSubmit(result.message);
      return;
    }
    // Stay blocked: the parent is about to navigate to results.
    finish();
  }

  /** True when the response moved the runner forward (next section or results). */
  function handleSessionResult(data: CompleteSessionResult): boolean {
    if (data.paperCompleted) {
      if (!data.results) return false;
      finish();
      return true;
    }
    if (!data.nextSession) return false;
    applyResumePayload(data.nextSession);
    setIsSubmitting(false);
    return true;
  }

  /**
   * The complete call may have landed even though the response was lost.
   * Re-sync from the server before deciding whether to retry.
   */
  async function recoverSession(sectionBefore: number, failure: string) {
    const resumed = await resumeAttempt(attemptId);
    if (!resumed.ok) {
      failSubmit(failure);
      return;
    }
    const advanced = resumeSessionIndex(resumed.data) > sectionBefore;
    if (!advanced && resumeSessionIsOpen(resumed.data)) {
      const retry = await completeSession(attemptId);
      if (retry.ok && handleSessionResult(retry.data)) return;
      applyResumePayload(resumed.data);
      failSubmit(retry.ok ? SECTION_ERROR : retry.message);
      return;
    }
    applyResumePayload(resumed.data);
    if (advanced) setNotice("Your previous section was already submitted.");
    setIsSubmitting(false);
  }

  async function handleCompleteSession() {
    setShowSubmit(false);
    setIsSubmitting(true);
    setCompletingLabel(
      lastSession ? "Submitting your test..." : "Starting next section...",
    );
    setSubmitError(null);
    const sectionBefore = mockTestData.currentSessionIndex ?? 0;
    let failure: string | null = null;
    if (isPaused) {
      // Sections can only be completed while running; adopt the server clock
      // that comes back with the resume so the next timer starts correct.
      const resumed = await resumeAttempt(attemptId);
      if (resumed.ok) applyResumePayload(resumed.data);
      else failure = resumed.message;
    }
    if (failure === null) {
      const completed = await completeSession(attemptId);
      if (completed.ok && handleSessionResult(completed.data)) return;
      failure = completed.ok ? SECTION_ERROR : completed.message;
    }
    await recoverSession(sectionBefore, failure);
  }

  function handleConfirmSubmit() {
    void (isSessionWise ? handleCompleteSession() : handleSubmitPaper());
  }

  async function handlePauseAndExit() {
    setIsExiting(true);
    setExitError(null);
    try {
      if (!isPaused) {
        const result = await pauseAttempt(attemptId);
        if (!result.ok) {
          setExitError(result.message);
          return;
        }
      }
      disarm();
      clearCachedAttempt(attemptId);
      router.push(exitHref);
    } finally {
      // Soft Nav may keep this tree mounted after navigation — never leave
      // the pause overlay stuck on "Saving & Exiting...".
      setIsExiting(false);
    }
  }

  if (!currentQuestion) {
    return (
      <AttemptErrorState
        title="No questions to show"
        message="This test has no questions available right now."
        actions={
          <StudyControlLink
            href={exitHref}
            variant="solid"
            className={`${ACTION_BUTTON} min-w-[11rem]`}
          >
            {exitLabel}
          </StudyControlLink>
        }
      />
    );
  }

  /** Tapping the selected option again clears it. */
  const handleOptionSelect = (optionId: string) => {
    const questionId = currentQuestion._id;
    saveAnswer(
      questionId,
      answers.get(questionId) === optionId ? null : optionId,
    );
  };

  const handleClearResponse = () => {
    if (!answers.has(currentQuestion._id)) return;
    saveAnswer(currentQuestion._id, null);
  };

  const handleMarkForReview = () => {
    const questionId = currentQuestion._id;
    setMarked((prev) => new Set(prev).add(questionId));
    goTo(currentIndex + 1);
  };

  const currentAnswerId = answers.get(currentQuestion._id);
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const paletteProps = {
    statuses,
    currentIndex,
    isPaused,
    onTogglePause: () => void (isPaused ? handleResume() : handlePause()),
    testTitle: title,
    ...(isSessionWise ? { sectionTitle: sectionLabel } : {}),
    submitLabel,
  };

  const forwardButton = isLastQuestion ? (
    <StudyButton
      variant="solid"
      onClick={() => setShowSubmit(true)}
      disabled={isPaused}
      className={`${ACTION_BUTTON} flex-1 lg:ml-auto lg:min-w-[10.5rem] lg:flex-none lg:px-7`}
    >
      {submitLabel}
    </StudyButton>
  ) : (
    <StudyButton
      variant="solid"
      onClick={() => goTo(currentIndex + 1)}
      className={`${ACTION_BUTTON} flex-1 lg:ml-auto lg:min-w-[10.5rem] lg:flex-none lg:px-7`}
    >
      Save &amp; Next
      <ChevronRight className="h-4 w-4" aria-hidden />
    </StudyButton>
  );

  return (
    <MathpixBoundary>
      <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
        <AttemptHeader
          title={title}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          sectionLabel={sectionLabel}
          zoomIndex={zoomIndex}
          onZoomIndexChange={(index) => setZoomIndex(clampZoomIndex(index))}
          secondsLeft={secondsLeft}
          showLanguageToggle={Boolean(mockTestData.exam.hasMultiLingualSupport)}
          language={language}
          onLanguageChange={setLanguage}
        />

        {isSessionWise && activeSession ? (
          <div className="shrink-0 border-b border-study-divider bg-white">
            <div className="mx-auto w-full max-w-7xl px-3 py-2 sm:px-4">
              <span className="inline-flex items-center rounded-md bg-study-green px-3 py-1.5 text-sm font-semibold text-white uppercase">
                {activeSession.name || `Section ${activeSession.order + 1}`}
              </span>
            </div>
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="shrink-0 border-b border-study-divider bg-study-peach"
          >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 text-sm text-study-peach-ink sm:px-4">
              <p>{notice}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss message"
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-white/50"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-7xl flex-1 px-3 pt-4 pb-28 sm:px-4 lg:min-h-0 lg:overflow-hidden lg:py-3">
          <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
              <QuestionPanel
                question={currentQuestion}
                number={currentIndex + 1}
                language={language}
                zoomIndex={zoomIndex}
                selectedOptionId={currentAnswerId}
                onSelectOption={handleOptionSelect}
              />

              <div className="flex gap-2 lg:hidden">
                <StudyButton
                  variant="surface"
                  onClick={handleMarkForReview}
                  className={`${ACTION_BUTTON} flex-1`}
                >
                  <Flag className="h-4 w-4" aria-hidden />
                  Mark &amp; Next
                </StudyButton>
                <StudyButton
                  variant="surface"
                  onClick={handleClearResponse}
                  className={`${ACTION_BUTTON} flex-1`}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Clear
                </StudyButton>
              </div>

              <div className="hidden items-center gap-2.5 border-t border-study-divider pt-2.5 lg:flex">
                <StudyButton
                  variant="surface"
                  onClick={() => goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className={`${ACTION_BUTTON} h-12 px-4`}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Previous
                </StudyButton>
                <StudyButton
                  variant="surface"
                  onClick={handleMarkForReview}
                  className={`${ACTION_BUTTON} h-12 px-4`}
                >
                  <Flag className="h-4 w-4" aria-hidden />
                  Mark for Review &amp; Next
                </StudyButton>
                <StudyButton
                  variant="surface"
                  onClick={handleClearResponse}
                  className={`${ACTION_BUTTON} h-12 px-4`}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Clear Response
                </StudyButton>
                {forwardButton}
              </div>
            </div>

            <aside
              aria-label="Question palette"
              className="hidden rounded-[16px] border border-study-divider bg-white p-4 lg:block lg:min-h-0"
            >
              <QuestionPalette
                {...paletteProps}
                onSelect={goTo}
                onSubmit={() => setShowSubmit(true)}
              />
            </aside>
          </div>
        </main>

        <nav
          aria-label="Question navigation"
          className="fixed right-0 bottom-0 left-0 z-30 border-t border-study-divider bg-white pb-[var(--safe-bottom)] lg:hidden"
        >
          <div className="mx-auto flex w-full max-w-7xl gap-2 px-3 py-3">
            <StudyButton
              variant="surface"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className={`${ACTION_BUTTON} h-12 flex-1`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev
            </StudyButton>
            <StudyButton
              variant="outline"
              onClick={() => setMobilePaletteOpen(true)}
              aria-label="Open question palette"
              className="inline-flex h-12 w-12 items-center justify-center rounded-[10px]"
            >
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </StudyButton>
            {forwardButton}
          </div>
        </nav>

        <AttemptModal
          open={mobilePaletteOpen}
          onClose={() => setMobilePaletteOpen(false)}
          labelledBy="mobile-palette-title"
          variant="sheet"
        >
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="mobile-palette-title"
                className="font-display text-base font-semibold text-study-ink"
              >
                Questions
              </h2>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(false)}
                aria-label="Close question palette"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-study-ink hover:bg-study-mint"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <QuestionPalette
                {...paletteProps}
                onSelect={(index) => {
                  goTo(index);
                  setMobilePaletteOpen(false);
                }}
                onSubmit={() => {
                  setMobilePaletteOpen(false);
                  setShowSubmit(true);
                }}
              />
            </div>
          </div>
        </AttemptModal>

        <SubmitDialog
          open={showSubmit}
          isSessionWise={isSessionWise}
          isLastSession={lastSession}
          sectionName={sectionLabel}
          summary={summary}
          submitLabel={submitLabel}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowSubmit(false)}
        />

        <PauseOverlay
          open={isPaused}
          timeUsedSeconds={consumed}
          remainingSeconds={secondsLeft}
          paperUsedSeconds={
            isSessionWise && paperConsumed > consumed ? paperConsumed : null
          }
          sectionName={activeSession?.name ?? null}
          exitLabel={exitLabel}
          isResuming={isResuming}
          isExiting={isExiting}
          error={resumeError ?? exitError}
          onResume={() => void handleResume()}
          onExit={() => void handlePauseAndExit()}
        />

        <ExitDialog
          open={showExit}
          isExiting={isExiting}
          exitError={exitError}
          onStay={() => setShowExit(false)}
          onConfirm={() => void handlePauseAndExit()}
        />

      </div>
    </MathpixBoundary>
  );
}
