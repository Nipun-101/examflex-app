"use client";

import { StudyNavLink } from "@/components/study/study-nav-link";
import { usePathname } from "next/navigation";
import { examTestListPath } from "@/lib/mocks/exam-test-routes";

type ExamHubNavProps = {
  examId: string;
};

/** Paper-type tabs only — Chapter Wise is the default landing. */
export function examHubTabs(examId: string) {
  return [
    {
      href: examTestListPath(examId, "TOPIC_WISE"),
      label: "Chapter Wise",
    },
    {
      href: examTestListPath(examId, "FULL_EXAM"),
      label: "Full Mocks",
    },
    {
      href: examTestListPath(examId, "SPRINT"),
      // Cosmetic rename: backend SPRINT papers are displayed as "Rapid Rounds".
      label: "Rapid Rounds",
    },
  ];
}

export function ExamHubNav({ examId }: ExamHubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Exam sections"
      className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:gap-3"
    >
      {examHubTabs(examId).map((tab) => {
        const { href } = tab;
        const active =
          pathname === href || pathname.startsWith(`${href}/`);
        return (
          <StudyNavLink
            key={href}
            href={href}
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-11 shrink-0 items-center rounded-[10px] px-4 text-sm font-semibold whitespace-nowrap transition ${
              active
                ? "bg-study-green text-white"
                : "border border-study-divider bg-white text-study-ink hover:bg-study-mint"
            }`}
          >
            {tab.label}
          </StudyNavLink>
        );
      })}
    </nav>
  );
}
