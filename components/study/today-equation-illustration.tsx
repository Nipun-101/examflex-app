/** Stacked flashcards with F = ? for the Equation Book promo card. */
export function TodayEquationIllustration() {
  return (
    <div aria-hidden className="relative h-[4.25rem] w-[4.75rem] shrink-0">
      <div className="absolute top-3 left-0 h-12 w-11 rotate-[-8deg] rounded-[8px] bg-study-green/35" />
      <div className="absolute top-1.5 left-2 h-12 w-11 rotate-[-3deg] rounded-[8px] bg-study-lime/70" />
      <div className="absolute top-0 left-4 flex h-12 w-11 items-center justify-center rounded-[8px] border border-study-ink/20 bg-white shadow-soft">
        <span className="font-display text-sm font-semibold italic text-study-ink">
          F = ?
        </span>
      </div>
    </div>
  );
}
