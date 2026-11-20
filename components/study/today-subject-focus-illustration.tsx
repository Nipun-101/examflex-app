/**
 * Soft subject bars + lens for the Subject Insights desktop aside.
 * Same mark for empty and filled — “spot the softest chapter.”
 */
export function TodaySubjectFocusIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 168 128"
      className="h-[7.25rem] w-[9.5rem] shrink-0 text-study-ink/18"
      fill="none"
    >
      {/* Soft desk blot */}
      <ellipse
        cx="84"
        cy="108"
        rx="62"
        ry="10"
        className="fill-study-mint/70"
      />

      {/* Subject strips */}
      <rect
        x="18"
        y="22"
        width="96"
        height="18"
        rx="9"
        className="fill-study-canvas"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <rect
        x="30"
        y="28"
        width="34"
        height="6"
        rx="3"
        className="fill-study-ink/20"
      />
      <rect
        x="70"
        y="28"
        width="22"
        height="6"
        rx="3"
        className="fill-study-green/35"
      />

      <rect
        x="28"
        y="50"
        width="104"
        height="20"
        rx="10"
        className="fill-white"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="40"
        y="56.5"
        width="42"
        height="7"
        rx="3.5"
        className="fill-study-ink/25"
      />
      <rect
        x="90"
        y="56.5"
        width="30"
        height="7"
        rx="3.5"
        className="fill-study-green/55"
      />

      <rect
        x="22"
        y="78"
        width="90"
        height="18"
        rx="9"
        className="fill-study-canvas"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <rect
        x="34"
        y="84"
        width="28"
        height="6"
        rx="3"
        className="fill-study-ink/18"
      />
      <rect
        x="68"
        y="84"
        width="20"
        height="6"
        rx="3"
        className="fill-study-green/30"
      />

      {/* Spotlight wash behind the focused row */}
      <ellipse
        cx="118"
        cy="60"
        rx="34"
        ry="28"
        className="fill-study-lime/35"
      />

      {/* Magnifier */}
      <circle
        cx="128"
        cy="54"
        r="22"
        className="fill-white/80 stroke-study-ink"
        strokeWidth="2.25"
      />
      <circle
        cx="128"
        cy="54"
        r="14"
        className="stroke-study-green/45"
        strokeWidth="2"
      />
      <line
        x1="143"
        y1="70"
        x2="156"
        y2="88"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-study-ink"
      />
      {/* Tiny focus mark inside lens */}
      <path
        d="M121 54 H135 M128 47 V61"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-study-green"
      />
    </svg>
  );
}
