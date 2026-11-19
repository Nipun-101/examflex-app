/** Bookmark / note stack for the Mistake Book promo card. */
export function TodayMistakeIllustration() {
  return (
    <div aria-hidden className="relative h-[4.25rem] w-[4.75rem] shrink-0">
      <div className="absolute top-3 left-1 h-12 w-10 rotate-[6deg] rounded-[8px] bg-study-peach-ink/25" />
      <div className="absolute top-1.5 left-2.5 h-12 w-10 rotate-[2deg] rounded-[8px] bg-white/70" />
      <div className="absolute top-0 left-4 flex h-12 w-10 flex-col justify-center gap-1.5 rounded-[8px] border border-study-peach-ink/25 bg-white px-2 shadow-soft">
        <span className="block h-1 w-full rounded-full bg-study-peach-ink/35" />
        <span className="block h-1 w-3/4 rounded-full bg-study-peach-ink/25" />
        <span className="block h-1 w-1/2 rounded-full bg-study-green/40" />
      </div>
    </div>
  );
}
