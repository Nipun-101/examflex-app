/** Decorative spiral notebook + pencil for the Mistake Book empty hero. */
export function MistakeBookEmptyIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 180 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Spiral binding */}
      {[30, 48, 66, 84, 102, 120].map((y) => (
        <ellipse
          key={y}
          cx="24"
          cy={y}
          rx="9"
          ry="8"
          fill="white"
          stroke="#173d36"
          strokeWidth="2.2"
        />
      ))}

      {/* Page stack edge */}
      <path
        d="M32 18h92c4.4 0 8 3.6 8 8v104c0 4.4-3.6 8-8 8H32"
        fill="white"
        stroke="#173d36"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M32 18v120"
        stroke="#173d36"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M32 34h100"
        stroke="#173d36"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Dashed checklist */}
      {[52, 76, 100].map((y, index) => (
        <g key={y}>
          <circle
            cx="52"
            cy={y}
            r="6.5"
            stroke="#173d36"
            strokeWidth="2.1"
            strokeDasharray="2.8 2.4"
          />
          <path
            d={`M66 ${y}h${48 - index * 8}`}
            stroke="#173d36"
            strokeWidth="2.1"
            strokeLinecap="round"
            opacity="0.38"
          />
        </g>
      ))}

      {/* Pencil across the notebook */}
      <g transform="rotate(34 132 78)">
        <rect x="124" y="28" width="15" height="92" rx="3" fill="#176b56" />
        <path d="M124 28h15l-7.5-15L124 28z" fill="#173d36" />
        <rect x="124" y="108" width="15" height="11" rx="2" fill="#daec9b" />
        <path
          d="M128 46h7M128 60h7M128 74h7"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
    </svg>
  );
}
