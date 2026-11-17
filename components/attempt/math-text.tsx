"use client";

import { useMathpix } from "@/components/attempt/mathpix-boundary";
import { sanitizeAttemptRichText } from "@/lib/mocks/sanitize-attempt-text";

type MathTextProps = {
  text: string | null | undefined;
  inline?: boolean;
  className?: string;
};

/** Question/option/explanation text with Mathpix rendering when available. */
export function MathText({ text, inline = false, className = "" }: MathTextProps) {
  const api = useMathpix();
  const raw = typeof text === "string" ? text : "";
  const value = sanitizeAttemptRichText(raw);
  if (!value.trim()) return null;

  if (!api) {
    return (
      <div
        className={`break-words whitespace-pre-wrap text-inherit ${inline ? "inline" : ""} ${className}`.trim()}
      >
        {value}
      </div>
    );
  }

  const Markdown = api.MathpixMarkdown;
  return (
    <div
      className={`mathpix-content ${inline ? "mathpix-inline" : "mathpix-block"} ${className}`.trim()}
    >
      <Markdown text={value} htmlTags />
    </div>
  );
}
