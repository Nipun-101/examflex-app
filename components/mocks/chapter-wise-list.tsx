"use client";

import { useCallback } from "react";
import { PaperList } from "@/components/mocks/paper-list";
import { useResolvedExamId } from "@/hooks/use-exam-page";
import { getMockTestsByExam } from "@/lib/api/mock-tests";
import { chapterPaperToCard } from "@/lib/mocks/paper-card-model";
import { PAPER_PAGE_SIZE, type FetchPaperPage } from "@/lib/mocks/paper-page";

type ChapterWiseListProps = {
  /** Override for tests; defaults to the hub `ExamPageProvider` id. */
  examId?: string;
};

/** Chapter Wise = TOPIC_WISE papers. */
export function ChapterWiseList({ examId: examIdProp }: ChapterWiseListProps) {
  const examId = useResolvedExamId(examIdProp);

  const fetchPage = useCallback<FetchPaperPage>(
    async (page) => {
      const result = await getMockTestsByExam(examId, {
        page,
        limit: PAPER_PAGE_SIZE,
      });
      if (!result.ok) return result;
      return {
        ok: true,
        data: {
          items: result.data.data.map(chapterPaperToCard),
          pagination: result.data.pagination,
        },
      };
    },
    [examId]
  );

  return (
    <PaperList
      title="Chapter Wise"
      description="Focused papers by chapter and topic."
      emptyMessage="Chapter Wise papers for this exam will show up here soon."
      fetchPage={fetchPage}
    />
  );
}
