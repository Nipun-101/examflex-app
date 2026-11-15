type StudyLoaderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const SIZE_CLASS = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

export function StudyLoader({
  size = "md",
  className = "",
  label,
}: StudyLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <span className={`relative inline-flex ${SIZE_CLASS[size]}`} aria-hidden>
        <span className="study-loader-pulse absolute inset-[20%] rounded-full bg-study-mint" />
        <svg
          className="study-loader-spin absolute inset-0 h-full w-full"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-study-divider"
          />
          <path
            d="M24 6a18 18 0 1 1-12.728 30.728"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="text-study-green"
          />
          <circle cx="24" cy="6" r="3.25" className="fill-study-lime stroke-study-green" strokeWidth="1" />
        </svg>
      </span>
      {label ? (
        <p className="max-w-[16rem] text-center text-sm font-medium text-study-ink">
          {label}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
