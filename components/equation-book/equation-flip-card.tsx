"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { FlipHorizontal2 } from "lucide-react";
import { EquationImage } from "@/components/equation-book/equation-image";
import { MathText } from "@/components/attempt/math-text";
import { EQUATION_BOOK_COPY } from "@/types/equation-book";
import type { EquationItem } from "@/types/equation-book";

type EquationFlipCardProps = {
  card: EquationItem;
  revealed: boolean;
  onReveal: () => void;
};

/** Keep in sync with `.equation-flip-inner` transition in globals.css */
const FLIP_HALF_MS = 325;

export function EquationFlipCard({
  card,
  revealed,
  onReveal,
}: EquationFlipCardProps) {
  const hasLong = Boolean(card.longDescription?.trim());
  const hasMnemonic = Boolean(card.mnemonic?.trim());
  const bullets = card.bulletPoints.filter((item) => item.trim());
  const [flipped, setFlipped] = useState(revealed);
  const [syncedCardId, setSyncedCardId] = useState(card.id);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [isFlipping, setIsFlipping] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  if (syncedCardId !== card.id) {
    setSyncedCardId(card.id);
    setFlipped(revealed);
    setIsFlipping(false);
  } else if (!isFlipping && flipped !== revealed) {
    setFlipped(revealed);
  }

  // The flip container needs an explicit height (the two faces overlap), but
  // that height must follow the visible face: equations render asynchronously
  // and re-wrap when the viewport changes, so a one-time measurement clips them.
  useLayoutEffect(() => {
    const node = flipped ? backRef.current : frontRef.current;
    if (!node) return;

    const measure = () => setHeight(Math.ceil(node.scrollHeight));
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [flipped, card, hasLong, hasMnemonic, bullets.length]);

  function handleFlip() {
    if (revealed || flipped || isFlipping) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setFlipped(true);
      onReveal();
      return;
    }

    setIsFlipping(true);
    setFlipped(true);
    window.setTimeout(() => {
      onReveal();
      setIsFlipping(false);
    }, FLIP_HALF_MS);
  }

  return (
    <article className="flex h-full min-w-0 flex-col rounded-[20px] bg-study-lilac px-5 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-study-green uppercase">
        {revealed ? EQUATION_BOOK_COPY.revealedLabel : EQUATION_BOOK_COPY.eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[1.5rem] font-semibold leading-[1.3] break-words [overflow-wrap:anywhere] text-study-ink sm:text-[1.875rem] lg:mt-4 lg:text-[2.25rem]">
        {card.title}
      </h2>
      <p className="mt-4 text-sm leading-[1.5] break-words text-study-muted sm:text-base">
        {card.shortDescription}
      </p>

      <div className="my-6 h-px w-full bg-study-lilac-ink/20 lg:my-8" aria-hidden />

      <div className="equation-flip-scene mt-auto min-w-0">
        <div
          className={`equation-flip-inner${flipped ? " equation-flip-inner--flipped" : ""}`}
          style={height != null ? { height } : undefined}
        >
          <div ref={frontRef} className="equation-flip-face equation-flip-face--front">
            <button
              type="button"
              onClick={handleFlip}
              disabled={revealed || flipped || isFlipping}
              className="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[16px] border-2 border-study-green/40 bg-white px-4 py-9 text-center shadow-soft transition-[transform,box-shadow,border-color,background-color] hover:-translate-y-0.5 hover:border-study-green/70 hover:bg-study-mint/50 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink active:translate-y-0 disabled:cursor-default sm:py-10"
              aria-label="Flip to reveal the equation"
            >
              <span
                className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(23,107,86,0.18),transparent_52%),radial-gradient(circle_at_82%_78%,rgba(79,68,108,0.16),transparent_48%)]"
                aria-hidden
              />
              <span
                className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-study-green/55 bg-study-mint text-study-green shadow-soft transition-transform duration-300 group-hover:scale-105 group-hover:border-study-green group-hover:bg-study-lime/80"
                aria-hidden
              >
                <FlipHorizontal2
                  className="h-7 w-7 stroke-[2.25] transition-transform duration-500 group-hover:rotate-12"
                  aria-hidden
                />
              </span>
              <span className="relative font-display text-xl font-semibold tracking-tight text-study-ink sm:text-[1.375rem]">
                Tap to flip
              </span>
              <span className="relative max-w-[16rem] text-sm leading-snug text-study-muted">
                Give it a beat — then lock it in.
              </span>
            </button>
          </div>

          <div ref={backRef} className="equation-flip-face equation-flip-face--back">
            <div className="min-w-0 rounded-[16px] border border-study-green/25 bg-white px-4 py-5 shadow-soft sm:px-5 sm:py-6">
              <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-study-green uppercase">
                Equation
              </p>
              <div className="mt-3 min-w-0 overflow-x-auto font-display text-[1.25rem] font-medium leading-[1.35] text-study-ink [-webkit-overflow-scrolling:touch] [&_#preview]:!block [&_#preview]:!max-w-full [&_#preview]:!p-0 sm:text-[1.75rem] lg:text-[2rem]">
                <MathText text={card.equation} />
              </div>

              {card.imageUrl ? (
                <div className="mt-4 flex min-w-0 justify-center">
                  <EquationImage
                    src={card.imageUrl}
                    title={card.title}
                    loading="eager"
                    className="max-h-80 w-auto"
                  />
                </div>
              ) : null}

              {hasLong ? (
                <p className="mt-4 text-sm leading-[1.5] text-study-ink sm:text-base lg:mt-5">
                  {card.longDescription}
                </p>
              ) : null}

              {hasMnemonic ? (
                <div className="mt-4 rounded-[12px] border border-study-green/15 bg-study-mint px-4 py-3">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-study-green uppercase">
                    Memory trick
                  </p>
                  <div className="mt-1 min-w-0 overflow-x-auto text-sm leading-[1.45] text-study-ink [-webkit-overflow-scrolling:touch] [&_#preview]:!block [&_#preview]:!max-w-full [&_#preview]:!p-0">
                    <MathText text={card.mnemonic} />
                  </div>
                </div>
              ) : null}

              {bullets.length > 0 ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-study-ink sm:text-base">
                  {bullets.map((bullet) => (
                    <li key={bullet}>
                      <MathText text={bullet} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
