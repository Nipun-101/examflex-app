"use client";

import { Pause, Play } from "lucide-react";
import { AttemptModal } from "@/components/attempt/attempt-modal";
import { StudyButton } from "@/components/study/study-button";
import { formatElapsed } from "@/lib/mocks/attempt-format";

type PauseOverlayProps = {
  open: boolean;
  timeUsedSeconds: number;
  remainingSeconds: number;
  /** Shown when the whole paper has used more than the current section. */
  paperUsedSeconds: number | null;
  sectionName: string | null;
  exitLabel: string;
  isResuming: boolean;
  isExiting: boolean;
  error: string | null;
  onResume: () => void;
  onExit: () => void;
};

/** Blocking pause screen. The timer is frozen on the server while it shows. */
export function PauseOverlay({
  open,
  timeUsedSeconds,
  remainingSeconds,
  paperUsedSeconds,
  sectionName,
  exitLabel,
  isResuming,
  isExiting,
  error,
  onResume,
  onExit,
}: PauseOverlayProps) {
  return (
    <AttemptModal
      open={open}
      onClose={onResume}
      dismissible={false}
      labelledBy="pause-overlay-title"
    >
      <div className="space-y-5 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-study-lime text-study-ink">
          <Pause className="h-8 w-8" aria-hidden />
        </span>
        <div>
          <h2
            id="pause-overlay-title"
            className="mb-1 font-display text-xl font-semibold text-study-ink"
          >
            Test Paused
          </h2>
          <p className="text-sm text-study-muted-soft">
            Your progress is saved. Resume whenever you&apos;re ready.
          </p>
        </div>

        <div className="rounded-xl border border-study-divider bg-study-canvas px-4 py-3">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-study-muted-soft uppercase">
                Time used
              </p>
              <p className="mt-0.5 font-bold text-study-ink tabular-nums">
                {formatElapsed(timeUsedSeconds)}
              </p>
            </div>
            <div className="h-8 w-px bg-study-divider" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-study-muted-soft uppercase">
                Remaining
              </p>
              <p className="mt-0.5 font-bold text-study-green tabular-nums">
                {formatElapsed(remainingSeconds)}
              </p>
            </div>
          </div>
          {paperUsedSeconds !== null ? (
            <p className="mt-2 text-xs text-study-muted-soft">
              Paper so far: {formatElapsed(paperUsedSeconds)}
              {sectionName ? ` · this section: ${sectionName}` : ""}
            </p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="text-sm text-study-peach-ink">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <StudyButton
            variant="solid"
            onClick={onResume}
            disabled={isResuming || isExiting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-semibold"
          >
            <Play className="h-4 w-4" aria-hidden />
            {isResuming ? "Resuming..." : "Resume Test"}
          </StudyButton>
          <StudyButton
            variant="surface"
            onClick={onExit}
            disabled={isResuming || isExiting}
            className="inline-flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-semibold"
          >
            {isExiting ? "Saving & Exiting..." : exitLabel}
          </StudyButton>
        </div>
      </div>
    </AttemptModal>
  );
}
