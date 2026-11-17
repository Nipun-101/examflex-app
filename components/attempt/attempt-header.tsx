"use client";

import { AttemptTimer } from "@/components/attempt/attempt-timer";
import { LanguageToggle } from "@/components/attempt/language-toggle";
import { ZoomControls } from "@/components/attempt/zoom-controls";
import { APP_NAME } from "@/lib/constants";
import type { AttemptLanguage } from "@/types/attempt";

type AttemptHeaderProps = {
  title: string;
  questionNumber: number;
  totalQuestions: number;
  sectionLabel: string;
  zoomIndex: number;
  onZoomIndexChange: (index: number) => void;
  secondsLeft: number;
  /** Hidden when the exam has no multilingual support. */
  showLanguageToggle: boolean;
  language: AttemptLanguage;
  onLanguageChange: (language: AttemptLanguage) => void;
};

/** Sticky runner header: title/progress, zoom, timer, language. No StudyNav. */
export function AttemptHeader({
  title,
  questionNumber,
  totalQuestions,
  sectionLabel,
  zoomIndex,
  onZoomIndexChange,
  secondsLeft,
  showLanguageToggle,
  language,
  onLanguageChange,
}: AttemptHeaderProps) {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-study-divider bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Plain mark, not a link: leaving mid-attempt must go through pause. */}
          {/* Text wordmark — kept for easy rollback
          <span className="hidden font-display text-xl font-bold tracking-tight text-study-ink lowercase sm:inline">
            {APP_NAME.toLowerCase()}
          </span>
          */}
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG wordmark from /public */}
          <img
            src="/examflex-wordmark.svg"
            alt={APP_NAME}
            width={120}
            height={32}
            className="hidden h-7 w-auto sm:block"
          />

          <div className="min-w-0 sm:border-l sm:border-study-divider sm:pl-3">
            <h1 className="truncate font-display text-sm leading-tight font-semibold text-study-ink sm:text-base">
              {title}
            </h1>
            <p className="truncate text-xs leading-tight text-study-muted-soft">
              Q {questionNumber}/{totalQuestions} · {sectionLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <ZoomControls
            zoomIndex={zoomIndex}
            onZoomIndexChange={onZoomIndexChange}
          />
          <AttemptTimer secondsLeft={secondsLeft} />
          {showLanguageToggle ? (
            <LanguageToggle
              language={language}
              onLanguageChange={onLanguageChange}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
