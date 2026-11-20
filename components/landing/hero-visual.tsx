import { Check } from "lucide-react";

const FLOAT_CARD = "absolute rounded-[22px] bg-card p-4 shadow-lift";

/**
 * Product collage laid out on a fixed 560×620 stage (as designed) and scaled
 * down below `lg`, so the composition never reflows on small screens.
 */
export function HeroVisual() {
  return (
    <div className="animate-fade-up-delay mx-auto h-[388px] w-[350px] lg:h-[620px] lg:w-[560px]">
      <div className="relative h-[620px] w-[560px] origin-top-left scale-[0.625] rounded-[40px] bg-[linear-gradient(160deg,var(--secondary)_0%,#bcd3c7_100%)] ring-1 ring-inset ring-white/60 lg:scale-100">
        <div
          className={`${FLOAT_CARD} left-[30px] top-10 w-[362px] bg-study-ink text-white`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-study-lime">
            Pick up where you left off
          </p>
          <p className="mb-1.5 mt-2 font-display text-[22px] font-bold leading-tight tracking-tight">
            Your mistakes have a next chapter.
          </p>
          <p className="text-[13px] text-study-on-dark">
            19 questions left from Mock 12. Start with 5 today.
          </p>
          <span className="mt-3 inline-block rounded-2xl bg-study-lime px-4 py-2 text-[13px] font-semibold text-study-ink">
            Open Mistake Book →
          </span>
        </div>

        <div
          className={`${FLOAT_CARD} left-[330px] top-[190px] z-20 flex w-[232px] flex-col items-center gap-1.5 text-center`}
        >
          <div className="relative h-[84px] w-[84px]">
            <svg
              width="84"
              height="84"
              viewBox="0 0 80 80"
              role="img"
              aria-label="Score 548 of 720"
            >
              <circle
                cx="40"
                cy="40"
                r="30"
                fill="none"
                stroke="var(--study-mint)"
                strokeWidth="9"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="143.5 188.5"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[17px] font-bold">
              548
            </span>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Mock 12 · of 720
          </p>
          <span className="rounded-xl bg-study-mint px-3 py-1.5 text-xs font-semibold text-primary">
            +18 from Mock 11
          </span>
        </div>

        <div className={`${FLOAT_CARD} left-9 top-[330px] z-10 w-[332px]`}>
          <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-study-green">
            <span>Physics · Q34</span>
            <span className="font-medium normal-case tracking-normal text-muted-foreground">
              In exam: 2m 40s
            </span>
          </div>
          <p className="mb-2.5 mt-2 text-sm font-medium leading-snug">
            A 2 kg block slides down a rough 30° incline. Find its acceleration.
          </p>
          <div className="flex gap-2">
            <span className="flex-1 rounded-[10px] bg-study-peach px-2.5 py-2 text-xs font-semibold text-study-peach-ink">
              You: B · 4.9
            </span>
            <span className="flex-1 rounded-[10px] bg-primary-soft px-2.5 py-2 text-xs font-semibold text-success">
              Right: C · 3.2
            </span>
          </div>
          <p className="mt-2.5 rounded-[10px] bg-study-lilac px-2.5 py-2 text-xs font-semibold text-study-lilac-ink">
            NCERT XI · Laws of motion · p. 109
          </p>
        </div>

        <div
          className={`${FLOAT_CARD} left-[340px] top-[400px] z-30 flex w-[214px] justify-center bg-study-lilac p-3`}
        >
          <svg viewBox="0 0 160 110" width="150" role="img" aria-label="Flashcards">
            <g
              stroke="var(--study-ink)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            >
              <rect
                x="32"
                y="14"
                width="96"
                height="70"
                rx="12"
                fill="var(--study-lime)"
                transform="rotate(-12 80 55)"
              />
              <rect
                x="32"
                y="14"
                width="96"
                height="70"
                rx="12"
                fill="#f6efd2"
                transform="rotate(10 80 55)"
              />
              <rect x="32" y="14" width="96" height="70" rx="12" fill="#fff" />
            </g>
            <text
              x="80"
              y="58"
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontStyle="italic"
              fontSize="26"
              fill="var(--study-ink)"
            >
              F = ?
            </text>
          </svg>
        </div>

        <div className={`${FLOAT_CARD} right-6 top-6 z-30 rounded-2xl px-3.5 py-2.5`}>
          <p className="text-[11px] font-medium text-muted-foreground">
            Rank range
          </p>
          <p className="text-[17px] font-bold">~14k to 19k</p>
        </div>

        <div
          className={`${FLOAT_CARD} bottom-7 left-10 z-20 flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-[13px] font-semibold`}
        >
          <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-study-mint text-primary">
            <Check className="h-3.5 w-3.5" aria-hidden />
          </span>
          Understood · removed from book
        </div>
      </div>
    </div>
  );
}
