"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import { clipExamDescription } from "@/lib/mocks/exam-card-copy";
import { paperCountLabel } from "@/lib/mocks/paper-count-label";
import { examTestListPath } from "@/lib/mocks/exam-test-routes";
import type { ApiExam } from "@/types/exam";
import type { PaperType } from "@/types/mock-test";

type ExamFeatureCardProps = {
  exam: ApiExam;
};

type PaperChip = {
  type: PaperType;
  label: string;
  count: number;
};

function initialLetter(title: string): string {
  const trimmed = title.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function ExamFeatureCard({ exam }: ExamFeatureCardProps) {
  const openHref = examTestListPath(exam.id, "TOPIC_WISE");
  const description = clipExamDescription(exam.description);
  const chips: PaperChip[] = [
    {
      type: "FULL_EXAM",
      label: "Full mocks",
      count: exam.paperCounts.fullMocks,
    },
    {
      type: "TOPIC_WISE",
      label: "Chapter-wise",
      count: exam.paperCounts.chapterWise,
    },
    {
      type: "SPRINT",
      label: "Sprint tests",
      count: exam.paperCounts.sprint,
    },
  ];

  return (
    <article className="flex h-full flex-col rounded-[22px] bg-study-ink p-5 text-white shadow-soft sm:p-6">
      {/* Logo height = badge + title; title shares the logo’s bottom baseline. */}
      <div className="flex gap-3.5 sm:gap-4">
        <div
          data-testid="exam-card-logo"
          className="relative size-16 shrink-0 overflow-hidden rounded-[14px] bg-study-mint sm:size-[4.5rem]"
        >
          {exam.imageUrl ? (
            <Image
              src={exam.imageUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <span
              aria-hidden
              className="grid h-full w-full place-items-center font-display text-2xl font-semibold text-study-ink"
            >
              {initialLetter(exam.title)}
            </span>
          )}
        </div>

        <div className="flex h-16 min-w-0 flex-1 flex-col justify-between sm:h-[4.5rem]">
          <div className="flex min-h-[1.375rem] items-start">
            {exam.trending ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-study-lime px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide text-study-ink uppercase">
                <Flame className="h-3.5 w-3.5" aria-hidden />
                Trending
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-3xl leading-none font-semibold tracking-tight sm:text-4xl">
            {exam.title}
          </h3>
        </div>
      </div>

      {/* Fixed description slot (2 lines) so empty/missing copy does not collapse the card. */}
      <p className="mt-3 min-h-[2.5rem] text-sm leading-relaxed text-study-on-dark line-clamp-2">
        {description || "\u00A0"}
      </p>

      <p className="mt-3 text-[0.6875rem] font-bold tracking-wide text-study-lime uppercase sm:text-xs">
        {exam.statsLabel}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {chips.map((chip) => (
          <Link
            key={chip.type}
            href={examTestListPath(exam.id, chip.type)}
            className="rounded-[12px] bg-white/10 px-3 py-3 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-lime"
          >
            <span className="block text-sm font-semibold text-white">
              {chip.label}
            </span>
            <span className="mt-0.5 block text-xs text-study-on-dark">
              {paperCountLabel(chip.count)}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:gap-5">
        <Link
          href={openHref}
          className="inline-flex h-12 w-fit max-w-full shrink-0 items-center justify-center rounded-full bg-study-lime px-5 text-sm font-bold whitespace-nowrap text-study-ink transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Open {exam.title} →
        </Link>
        <p className="text-xs leading-relaxed text-study-on-dark sm:text-[0.8125rem]">
          Ready when you are.
        </p>
      </div>
    </article>
  );
}
