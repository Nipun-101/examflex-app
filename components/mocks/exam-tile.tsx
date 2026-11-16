"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import { examHubPath } from "@/lib/mocks/exam-test-routes";

type ExamTileProps = {
  examId: string;
  title: string;
  imageUrl: string;
  testsCount: number;
  trending?: boolean;
};

export function ExamTile({
  examId,
  title,
  imageUrl,
  testsCount,
  trending = false,
}: ExamTileProps) {
  return (
    <Link
      href={examHubPath(examId)}
      className="group relative flex min-h-[11rem] flex-col items-center justify-start rounded-[14px] border border-study-divider bg-white px-4 py-5 text-center transition hover:-translate-y-0.5 hover:border-study-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green"
    >
      {trending ? (
        <span className="absolute top-2 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-study-green px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          <Flame className="h-3 w-3 fill-current" aria-hidden />
          Trending
        </span>
      ) : null}
      <div
        className={`relative mb-3 h-16 w-16 overflow-hidden rounded-[12px] bg-study-canvas ${
          trending ? "mt-3" : ""
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-xl font-semibold text-study-muted-soft">
            {title.charAt(0)}
          </span>
        )}
      </div>
      <p className="font-display text-sm font-semibold text-study-ink">{title}</p>
      <p className="mt-1 text-xs text-study-muted-soft">
        {testsCount} {testsCount === 1 ? "paper" : "papers"}
      </p>
    </Link>
  );
}
