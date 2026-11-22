"use client";

import { useRef, useState } from "react";

type OtpCodeInputProps = {
  value: string;
  length: number;
  onChange: (value: string) => void;
  /** Fired once when the last digit is entered. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  label: string;
  /** Tailwind classes for an empty/filled slot and for the focused slot. */
  slotClassName: string;
  activeSlotClassName: string;
};

/**
 * A row of digit boxes backed by ONE real input. That keeps paste, the
 * mobile one-time-code autofill and screen readers working, which separate
 * per-digit inputs tend to break.
 */
export function OtpCodeInput({
  value,
  length,
  onChange,
  onComplete,
  disabled = false,
  invalid = false,
  autoFocus = false,
  label,
  slotClassName,
  activeSlotClassName,
}: OtpCodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div
      className="relative"
      onClick={() => inputRef.current?.focus()}
      data-testid="otp-code-input"
    >
      <div className="flex justify-center gap-2.5" aria-hidden>
        {Array.from({ length }, (_, index) => {
          const isActive = focused && !disabled && index === activeIndex;
          return (
            <div
              key={index}
              className={`grid h-12 w-12 place-items-center rounded-[10px] border text-xl font-semibold transition-colors ${
                invalid ? "border-red-400" : ""
              } ${isActive ? activeSlotClassName : slotClassName}`}
            >
              {value[index] ?? ""}
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          // Enter must not submit a surrounding form; the code verifies itself.
          if (event.key === "Enter") event.preventDefault();
        }}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        aria-label={label}
        aria-invalid={invalid || undefined}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
    </div>
  );
}
