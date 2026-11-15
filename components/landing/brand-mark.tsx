import { APP_NAME } from "@/lib/constants";

type BrandMarkProps = {
  className?: string;
  light?: boolean;
};

export function BrandMark({ className = "", light = false }: BrandMarkProps) {
  const [exam, flex] = [APP_NAME.slice(0, 4), APP_NAME.slice(4)];

  return (
    <span className={`inline-flex shrink-0 items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className={`grid h-9 w-9 place-items-center rounded-xl font-display text-lg font-extrabold shadow-soft ${
          light
            ? "bg-white/15 text-white ring-1 ring-white/20"
            : "bg-gradient-primary text-primary-foreground"
        }`}
      >
        E
      </span>
      <span
        className={`font-display text-xl font-extrabold tracking-tight ${
          light ? "text-white" : "text-foreground"
        }`}
      >
        {exam}
        <span className={light ? "text-white/85" : "text-primary"}>{flex}</span>
      </span>
    </span>
  );
}
