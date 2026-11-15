import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white"
          >
            E
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </span>
        </div>
        <span className="text-xs font-medium text-muted sm:text-sm">
          NEET · JEE
        </span>
      </div>
    </header>
  );
}
