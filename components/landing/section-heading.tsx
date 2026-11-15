type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`max-w-2xl ${
        align === "center" ? "mx-auto text-center" : "text-left"
      } ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-pretty text-base text-muted-foreground md:mt-4 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
