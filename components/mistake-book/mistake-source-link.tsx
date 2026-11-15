import Link from "next/link";
import type { MistakeItem } from "@/types/mistake-book";

type MistakeSourceLinkProps = {
  mistake: MistakeItem;
};

export function MistakeSourceLink({ mistake }: MistakeSourceLinkProps) {
  return (
    <div>
      <Link
        href={mistake.sourceHref}
        className="text-xs font-medium whitespace-pre-wrap text-study-green transition-colors hover:text-study-ink"
      >
        {mistake.sourceLabel}
      </Link>
      <p className="mt-1 text-[0.6875rem] text-study-muted-soft">
        {mistake.sourceHint}
      </p>
    </div>
  );
}
