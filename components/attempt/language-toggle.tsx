"use client";

import { Languages } from "lucide-react";
import type { AttemptLanguage } from "@/types/attempt";

type LanguageToggleProps = {
  language: AttemptLanguage;
  onLanguageChange: (language: AttemptLanguage) => void;
  className?: string;
};

const OPTIONS: ReadonlyArray<{ value: AttemptLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "ml", label: "മലയാളം" },
];

/** EN / ML switch. Only rendered when the exam has multilingual support. */
export function LanguageToggle({
  language,
  onLanguageChange,
  className = "",
}: LanguageToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={`inline-flex items-center gap-1 rounded-[10px] border border-study-divider bg-white p-0.5 ${className}`.trim()}
    >
      <Languages className="ml-1.5 h-4 w-4 text-study-muted-soft" aria-hidden />
      {OPTIONS.map((option) => {
        const selected = option.value === language;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onLanguageChange(option.value)}
            className={`inline-flex h-10 min-w-11 cursor-pointer items-center justify-center rounded-[8px] px-2.5 text-xs font-semibold transition-colors sm:h-9 sm:text-sm ${
              selected
                ? "bg-study-green text-white"
                : "text-study-muted-soft hover:bg-study-mint hover:text-study-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
