"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import {
  AttemptImage,
  ImageUnavailableNotice,
} from "@/components/attempt/attempt-image";
import { AttemptModal } from "@/components/attempt/attempt-modal";

type EquationImageProps = {
  src: string;
  /** Equation title; names the picture and the enlarged view. */
  title: string;
  loading?: "eager" | "lazy";
  /** Size limits for the in-card thumbnail. */
  className?: string;
};

/**
 * An equation's picture. In the card it stays small; tapping it opens a
 * full-size view that always fits the screen (portaled to <body>, because the
 * flip card's 3D transform would otherwise trap a `fixed` overlay).
 */
export function EquationImage({
  src,
  title,
  loading = "lazy",
  className = "",
}: EquationImageProps) {
  const [open, setOpen] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const titleId = useId();
  const alt = `${title} illustration`;

  // Keep the page behind the viewer from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // A picture that cannot load shows its notice and is not clickable.
  if (failedSrc === src) {
    return <ImageUnavailableNotice className={className} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${title} illustration full size`}
        className="group relative inline-flex max-w-full min-w-0 cursor-zoom-in rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink"
      >
        <AttemptImage
          src={src}
          alt={alt}
          loading={loading}
          className={className}
          onLoadError={() => setFailedSrc(src)}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-study-ink/75 px-2 py-1 text-[0.625rem] font-medium text-white transition-colors group-hover:bg-study-ink"
        >
          <Maximize2 className="h-3 w-3" aria-hidden />
          Enlarge
        </span>
      </button>

      {open
        ? createPortal(
            <AttemptModal
              open
              onClose={() => setOpen(false)}
              labelledBy={titleId}
              variant="lightbox"
            >
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h2
                    id={titleId}
                    className="min-w-0 font-display text-sm font-semibold break-words text-study-ink sm:text-base"
                  >
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close picture"
                    className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-study-muted-soft transition-colors hover:bg-study-mint hover:text-study-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <div className="flex min-w-0 justify-center">
                  <AttemptImage
                    src={src}
                    alt={`${title} illustration, full size`}
                    loading="eager"
                    className="max-h-[calc(94dvh-6rem)] w-auto max-w-full object-contain"
                  />
                </div>
              </div>
            </AttemptModal>,
            document.body
          )
        : null}
    </>
  );
}
