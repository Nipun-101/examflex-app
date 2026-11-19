import { createElement } from "react";
import { StudyNavLink } from "@/components/study/study-nav-link";
import { ArrowRight } from "lucide-react";
import { formatSubmittedAt } from "@/lib/mistake-book/format-submitted-at";
import { paperTypeLabel } from "@/lib/mistake-book/selectors";
import {
  mistakeDotCount,
  mistakePaperKind,
  sessionBreadcrumb,
} from "@/lib/mistake-book/session-list";
import {
  paperSubjectTheme,
  resolvePaperCardIcon,
} from "@/lib/mocks/paper-subject-theme";
import type { MistakeBookSession } from "@/types/mistake-book";

type MistakeBookSessionCardProps = {
  session: MistakeBookSession;
};

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in srgb, var(--study-ink) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--study-ink) 12%, transparent) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
} as const;

function SessionIcon({
  Icon,
  size,
}: {
  Icon: ReturnType<typeof resolvePaperCardIcon>;
  size: "sm" | "md";
}) {
  const box =
    size === "sm"
      ? "size-12 rounded-[14px]"
      : "size-14 rounded-[16px]";
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <span
      className={`grid shrink-0 place-items-center border border-study-divider bg-white text-study-ink shadow-soft ${box}`}
    >
      {createElement(Icon, {
        className: icon,
        strokeWidth: 1.75,
        "aria-hidden": true,
      })}
    </span>
  );
}

function SessionChips({
  paperType,
  dateLabel,
  layout = "desktop",
}: {
  paperType: MistakeBookSession["paperType"];
  dateLabel: string;
  layout?: "mobile" | "desktop";
}) {
  const chipClass =
    layout === "mobile"
      ? "inline-flex rounded-[8px] bg-study-canvas px-2.5 py-1 text-xs font-semibold text-study-ink/80"
      : "inline-flex rounded-[8px] bg-study-canvas px-2.5 py-1 text-[0.6875rem] font-semibold text-study-ink/80";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={chipClass}>{paperTypeLabel(paperType)}</span>
      {dateLabel ? <span className={chipClass}>{dateLabel}</span> : null}
    </div>
  );
}

function SessionCount({ remainingCount }: { remainingCount: number }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <p className="shrink-0 text-right">
        <span className="block font-display text-2xl leading-none font-semibold tabular-nums text-study-ink sm:text-[1.75rem]">
          {remainingCount}
        </span>
        <span className="mt-0.5 block text-xs font-semibold text-study-ink/70">
          {remainingCount === 1 ? "mistake" : "mistakes"}
        </span>
      </p>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-study-ink text-white transition-transform group-hover:translate-x-0.5 sm:size-11">
        <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </span>
    </div>
  );
}

function SessionDots({
  count,
  layout = "desktop",
}: {
  count: number;
  layout?: "mobile" | "desktop";
}) {
  if (count <= 0) return null;
  const dotClass =
    layout === "mobile"
      ? "size-2 shrink-0 rounded-full bg-study-peach-ink/75"
      : "size-1.5 shrink-0 rounded-full bg-study-peach-ink/75";
  return (
    <span className="flex flex-wrap gap-1.5" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={dotClass} />
      ))}
    </span>
  );
}

export function MistakeBookSessionCard({
  session,
}: MistakeBookSessionCardProps) {
  const href = `/mistake-book/${session.mockTestId}`;
  const theme = paperSubjectTheme(session.subjectLabel ?? null);
  const Icon = resolvePaperCardIcon({
    kind: mistakePaperKind(session.paperType),
    subjectName: session.subjectLabel ?? null,
    topicName: session.topicLabel ?? null,
  });
  const breadcrumb = sessionBreadcrumb(session);
  const dateLabel = formatSubmittedAt(session.attemptSubmittedAt);
  const dots = mistakeDotCount(session.remainingCount);

  return (
    <StudyNavLink
      href={href}
      className="group block overflow-hidden rounded-[18px] border border-study-divider bg-white shadow-soft transition-colors hover:border-study-green/25"
    >
      {/* Mobile: colored header + white body (matches design) */}
      <div className="flex flex-col md:hidden">
        <div className={`relative px-4 py-4 ${theme.bandClass}`}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={GRID_STYLE}
          />
          <div className="relative flex items-center gap-3">
            <SessionIcon Icon={Icon} size="sm" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg leading-snug font-semibold tracking-tight text-study-ink">
                {session.title}
              </h3>
              {breadcrumb ? (
                <p className="mt-1 text-sm font-medium text-study-ink/75">
                  {breadcrumb}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <SessionChips
              paperType={session.paperType}
              dateLabel={dateLabel}
              layout="mobile"
            />
            <SessionDots count={dots} layout="mobile" />
          </div>
          <SessionCount remainingCount={session.remainingCount} />
        </div>
      </div>

      {/* Desktop / tablet: left color band */}
      <div className="hidden grid-cols-[5.5rem_minmax(0,1fr)] md:grid">
        <div className={`relative ${theme.bandClass}`}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={GRID_STYLE}
          />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <SessionIcon Icon={Icon} size="md" />
          </span>
        </div>

        <div className="flex min-w-0 flex-row items-center gap-4 px-5 py-4">
          <div className="min-w-0 shrink-0 md:w-[12.5rem] lg:w-[14rem]">
            <h3 className="font-display text-xl font-semibold tracking-tight text-study-ink">
              {session.title}
            </h3>
            <div className="mt-2">
              <SessionChips
                paperType={session.paperType}
                dateLabel={dateLabel}
              />
            </div>
            {breadcrumb ? (
              <p className="mt-2 text-sm font-medium text-study-ink/75">
                {breadcrumb}
              </p>
            ) : null}
          </div>

          <span className="flex min-h-4 min-w-0 flex-1 flex-wrap content-center justify-center gap-1.5 py-1">
            {dots > 0
              ? Array.from({ length: dots }, (_, index) => (
                  <span
                    key={index}
                    className="size-1.5 shrink-0 rounded-full bg-study-peach-ink/75"
                    aria-hidden
                  />
                ))
              : null}
          </span>

          <SessionCount remainingCount={session.remainingCount} />
        </div>
      </div>
    </StudyNavLink>
  );
}
