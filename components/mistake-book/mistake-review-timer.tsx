"use client";

import { useEffect, useState } from "react";
import { StudyButton } from "@/components/study/study-button";
import { formatReviewTimer } from "@/lib/mistake-book/format-timer";

type MistakeReviewTimerProps = {
  label: string;
  hint: string;
  resetKey: string;
};

export function MistakeReviewTimer({
  label,
  hint,
  resetKey,
}: MistakeReviewTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSeconds(0);
    setRunning(false);
  }, [resetKey]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const id = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [running]);

  return (
    <div className="rounded-[12px] bg-study-lilac px-3.5 py-3 sm:px-4 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6875rem] text-study-muted-soft">{label}</p>
          <p className="mt-1 font-display text-[1.3125rem] font-semibold tabular-nums text-study-ink">
            {formatReviewTimer(seconds)}
          </p>
        </div>
        <StudyButton
          variant="surface"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] px-5 text-[0.8125rem] font-medium"
          onClick={() => setRunning((value) => !value)}
        >
          {running ? "Stop" : "Start"}
        </StudyButton>
      </div>
      <p className="mt-3 text-xs leading-[1.4] text-study-muted-soft sm:text-[0.8125rem]">
        {hint}
      </p>
    </div>
  );
}
