type PaletteToggleButtonProps = {
  onClick: () => void;
  /** Questions the student has not opened yet. The badge dot hides at 0. */
  notVisitedCount: number;
};

/** Rounded panel with a dotted side rail, drawn to match the palette preview. */
function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <path d="M14.5 4.5v15" />
      <circle cx="17.75" cy="9.5" r="0.6" fill="currentColor" />
      <circle cx="17.75" cy="12" r="0.6" fill="currentColor" />
      <circle cx="17.75" cy="14.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * Mobile bottom-bar button that opens the question palette. A small amber dot
 * on its corner draws the eye while questions remain unvisited. It carries no
 * number on purpose: a count reads as pressure, a dot is just a nudge.
 */
export function PaletteToggleButton({
  onClick,
  notVisitedCount,
}: PaletteToggleButtonProps) {
  const showBadge = notVisitedCount > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open question palette"
      className="relative inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-[#b9cb74] bg-study-lime text-study-ink transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green"
    >
      <PaletteIcon />
      {showBadge ? (
        <span
          aria-hidden
          data-testid="palette-not-visited-badge"
          className="pointer-events-none absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#dca64b] ring-[3px] ring-white"
        />
      ) : null}
    </button>
  );
}
