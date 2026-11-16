import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type AttemptErrorStateProps = {
  title: string;
  message: string;
  /** Buttons / links row. */
  actions: ReactNode;
  icon?: ReactNode;
};

/** Full-screen failure or empty state for attempt routes. */
export function AttemptErrorState({
  title,
  message,
  actions,
  icon,
}: AttemptErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-study-peach text-study-peach-ink">
        {icon ?? <AlertCircle className="h-6 w-6" aria-hidden />}
      </span>
      <div className="max-w-md space-y-2">
        <h1 className="font-display text-2xl font-semibold text-study-ink">
          {title}
        </h1>
        <p className="text-sm text-study-muted-soft">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions}
      </div>
    </div>
  );
}
