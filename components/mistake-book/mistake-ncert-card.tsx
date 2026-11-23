"use client";

import { useState } from "react";
import { Columns2, Maximize2 } from "lucide-react";
import { MistakeNcertChips } from "@/components/mistake-book/mistake-ncert-chips";
import { MistakeNcertDialog } from "@/components/mistake-book/mistake-ncert-dialog";
import { StudyButton } from "@/components/study/study-button";
import { visibleCitation } from "@/lib/mistake-book/citation";
import type { MistakeItem } from "@/types/mistake-book";

type MistakeNcertCardProps = {
  mistake: MistakeItem;
};

/** The question's rank-1 NCERT passage; hidden when there is none to show. */
export function MistakeNcertCard({ mistake }: MistakeNcertCardProps) {
  const [open, setOpen] = useState(false);
  const citation = visibleCitation(mistake);
  if (!citation) return null;

  return (
    <article className="relative overflow-hidden rounded-[14px] bg-white py-4 pr-4 pl-5 shadow-soft sm:py-5 sm:pr-5 sm:pl-6 lg:flex lg:items-center lg:gap-5 lg:py-3.5 lg:pr-3.5 lg:pl-6">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5 bg-study-green"
      />
      <div className="flex items-center gap-3 lg:shrink-0 lg:gap-2.5">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-study-mint text-study-green lg:size-8"
        >
          <Columns2 className="size-4" strokeWidth={2.25} />
        </span>
        <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase lg:text-[0.6875rem]">
          NCERT reference
        </p>
      </div>

      {/* The title is shown only in the dialog, once the student opens it. */}
      <div className="mt-3 flex flex-col gap-3 lg:mt-0 lg:min-w-0 lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="min-w-0">
          <MistakeNcertChips citation={citation} />
        </div>
        <StudyButton
          variant="solid"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] px-5 text-[0.8125rem] font-semibold lg:h-10 lg:w-auto lg:px-4"
        >
          Read NCERT text
          <Maximize2 className="size-4" strokeWidth={2.25} aria-hidden />
        </StudyButton>
      </div>

      <MistakeNcertDialog
        open={open}
        onClose={() => setOpen(false)}
        citation={citation}
      />
    </article>
  );
}
