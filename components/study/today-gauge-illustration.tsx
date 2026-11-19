/** Decorative empty gauge for the locked Perspective card. */
export function TodayGaugeIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 72"
      className="h-14 w-[5.5rem] shrink-0"
      fill="none"
    >
      <path
        d="M14 58 A46 46 0 0 1 106 58"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-study-green/20"
      />
      <path
        d="M14 58 A46 46 0 0 1 36 26"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-study-green/50"
      />
      <circle cx="60" cy="58" r="5" className="fill-study-ink" />
      <line
        x1="60"
        y1="58"
        x2="28"
        y2="48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-study-ink"
      />
    </svg>
  );
}
