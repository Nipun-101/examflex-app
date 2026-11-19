import { StudyNavLink } from "@/components/study/study-nav-link";
import { APP_NAME, APP_STUDY_TAGLINE } from "@/lib/constants";

type StudyWordmarkProps = {
  href?: string;
};

export function StudyWordmark({ href = "/today" }: StudyWordmarkProps) {
  return (
    <StudyNavLink
      href={href}
      className="group flex min-w-0 flex-col gap-0.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink"
    >
      {/* Text wordmark — kept for easy rollback
      <span className="font-display text-[1.5rem] font-bold leading-[1.4] tracking-tight text-study-ink lowercase sm:text-[1.75rem]">
        {APP_NAME.toLowerCase()}
      </span>
      */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG wordmark from /public */}
      <img
        src="/examflex-wordmark.svg"
        alt={APP_NAME}
        width={135}
        height={36}
        className="h-7 w-auto sm:h-8 lg:h-9"
      />
      <span className="max-w-[15rem] text-[0.625rem] leading-[1.4] text-study-muted">
        {APP_STUDY_TAGLINE}
      </span>
    </StudyNavLink>
  );
}
