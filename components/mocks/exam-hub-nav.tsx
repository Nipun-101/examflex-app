"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { examHubPath, examTestListPath } from "@/lib/mocks/exam-test-routes";

type ExamHubNavProps = {
  examId: string;
};

/** Chapter Wise is the TOPIC_WISE paper type. */
export function examHubTabs(examId: string) {
  return [
    { href: examHubPath(examId), label: "Overview", exact: true },
    {
      href: examTestListPath(examId, "TOPIC_WISE"),
      label: "Chapter Wise",
      exact: false,
    },
    {
      href: examTestListPath(examId, "FULL_EXAM"),
      label: "Full Mocks",
      exact: false,
    },
    {
      href: examTestListPath(examId, "SPRINT"),
      label: "Sprint Tests",
      exact: false,
    },
  ];
}

export function ExamHubNav({ examId }: ExamHubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Exam sections"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
    >
      {examHubTabs(examId).map((tab) => {
        const { href } = tab;
        const active = tab.exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-11 shrink-0 items-center rounded-[10px] px-3 text-sm font-semibold whitespace-nowrap transition ${
              active
                ? "bg-study-green text-white"
                : "bg-white text-study-ink hover:bg-study-canvas"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
