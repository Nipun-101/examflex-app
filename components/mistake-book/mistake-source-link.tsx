import { StudyNavLink } from "@/components/study/study-nav-link";
import type { MistakeItem } from "@/types/mistake-book";

type MistakeSourceLinkProps = {
  mistake: MistakeItem;
};

export function MistakeSourceLink({ mistake }: MistakeSourceLinkProps) {
  if (!mistake.sourceLabel && !mistake.sourceHref) {
    return (
      <div>
        <p className="text-[0.6875rem] text-study-muted-soft">
          {mistake.sourceHint}
        </p>
      </div>
    );
  }

  return (
    <div>
      {mistake.sourceHref ? (
        <StudyNavLink
          href={mistake.sourceHref}
          className="text-xs font-medium whitespace-pre-wrap text-study-green transition-colors hover:text-study-ink"
        >
          {mistake.sourceLabel || "Source"}
        </StudyNavLink>
      ) : (
        <p className="text-xs font-medium whitespace-pre-wrap text-study-green">
          {mistake.sourceLabel}
        </p>
      )}
      <p className="mt-1 text-[0.6875rem] text-study-muted-soft">
        {mistake.sourceHint}
      </p>
    </div>
  );
}
