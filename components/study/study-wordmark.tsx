import Link from "next/link";
import { APP_NAME, APP_STUDY_TAGLINE } from "@/lib/constants";

type StudyWordmarkProps = {
  href?: string;
};

export function StudyWordmark({ href = "/today" }: StudyWordmarkProps) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col gap-0.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink"
    >
      <span className="font-display text-[1.5rem] font-bold leading-[1.4] tracking-tight text-study-ink lowercase sm:text-[1.75rem]">
        {APP_NAME.toLowerCase()}
      </span>
      <span className="max-w-[15rem] text-[0.625rem] leading-[1.4] text-study-muted">
        {APP_STUDY_TAGLINE}
      </span>
    </Link>
  );
}
