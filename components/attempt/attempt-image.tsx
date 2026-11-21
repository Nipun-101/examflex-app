"use client";

import { useState } from "react";

type AttemptImageProps = {
  src: string;
  alt: string;
  className?: string;
  /**
   * Lazy by default (long lists such as the answer key). The attempt runner
   * shows one question at a time and passes "eager" so its art is ready at once.
   */
  loading?: "eager" | "lazy";
  /** Lets a wrapper (e.g. an "enlarge" button) react when the picture fails. */
  onLoadError?: () => void;
};

/** Shown in place of a picture that could not be loaded. */
export function ImageUnavailableNotice({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      className={`inline-flex rounded-lg border border-dashed border-study-divider px-3 py-2 text-xs text-study-muted-soft ${className}`.trim()}
    >
      Image couldn&apos;t be loaded
    </span>
  );
}

/**
 * Question/option/explanation art. Hosts are arbitrary CDN URLs, so this stays
 * a plain img instead of next/image. If the URL cannot be loaded (for example
 * an expired pre-signed link) a visible notice replaces the blank gap.
 */
export function AttemptImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  onLoadError,
}: AttemptImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return <ImageUnavailableNotice className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => {
        setFailedSrc(src);
        onLoadError?.();
      }}
      className={`h-auto max-w-full rounded-lg ${className}`.trim()}
    />
  );
}
