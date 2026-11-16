type AttemptImageProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * Question/option/explanation art. Hosts are arbitrary CDN URLs, so this stays
 * a plain img instead of next/image.
 */
export function AttemptImage({ src, alt, className = "" }: AttemptImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`h-auto max-w-full rounded-lg ${className}`.trim()}
    />
  );
}
