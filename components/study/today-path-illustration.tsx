/**
 * Decorative 4-step path for the empty-state next-step card.
 * Winding dashed trail runs under the ovals so step numbers stay clear.
 */
export function TodayPathIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 -16 290 190"
      className="h-36 w-full max-w-[14.5rem] sm:h-[10.5rem] sm:max-w-[17rem]"
      fill="none"
    >
      {/* Creative S-curve trail — scoops under each stone */}
      <path
        d="M38 168
           C 58 174, 72 168, 82 150
           C 92 130, 88 118, 102 112
           C 128 120, 142 108, 152 92
           C 162 78, 168 72, 180 74
           C 210 82, 228 62, 252 46"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="2.5 6.5"
        strokeLinecap="round"
        className="text-white/45"
      />

      {/* Step 1 */}
      <ellipse cx="38" cy="148" rx="24" ry="15" className="fill-study-lime" />
      <text
        x="38"
        y="153"
        textAnchor="middle"
        className="fill-study-ink"
        style={{ fontSize: "14px", fontWeight: 700 }}
      >
        1
      </text>

      {/* Step 2 */}
      <ellipse
        cx="102"
        cy="98"
        rx="22"
        ry="14"
        className="fill-transparent stroke-white/50"
        strokeWidth="1.75"
      />
      <text
        x="102"
        y="103"
        textAnchor="middle"
        className="fill-white/65"
        style={{ fontSize: "13px", fontWeight: 600 }}
      >
        2
      </text>

      {/* Step 3 */}
      <ellipse
        cx="180"
        cy="60"
        rx="22"
        ry="14"
        className="fill-transparent stroke-white/40"
        strokeWidth="1.75"
      />
      <text
        x="180"
        y="65"
        textAnchor="middle"
        className="fill-white/55"
        style={{ fontSize: "13px", fontWeight: 600 }}
      >
        3
      </text>

      {/* Step 4 — top rim at cy - ry = 14 */}
      <ellipse
        cx="252"
        cy="28"
        rx="20"
        ry="14"
        className="fill-transparent stroke-white/35"
        strokeWidth="1.75"
      />
      <text
        x="252"
        y="33"
        textAnchor="middle"
        className="fill-white/50"
        style={{ fontSize: "13px", fontWeight: 600 }}
      >
        4
      </text>

      {/* Flag on the top rim of step 4 */}
      <line
        x1="252"
        y1="14"
        x2="252"
        y2="-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-study-lime"
      />
      <path d="M252 -12 L278 -4 L252 4 Z" className="fill-study-lime" />
    </svg>
  );
}
