"use client";

import { useCallback } from "react";
import { PaperList } from "@/components/mocks/paper-list";
import { useResolvedExamId } from "@/hooks/use-exam-page";
import { getSprintTests } from "@/lib/api/sprint-tests";
import { sprintTestToCard } from "@/lib/mocks/paper-card-model";
import { PAPER_PAGE_SIZE, type FetchPaperPage } from "@/lib/mocks/paper-page";

type SprintTestsListProps = {
  /** Override for tests; defaults to the hub `ExamPageProvider` id. */
  examId?: string;
};

export function SprintTestsList({ examId: examIdProp }: SprintTestsListProps) {
  const examId = useResolvedExamId(examIdProp);

  const fetchPage = useCallback<FetchPaperPage>(
    async (page) => {
      const result = await getSprintTests({
        examId,
        page,
        limit: PAPER_PAGE_SIZE,
      });
      if (!result.ok) return result;
      return {
        ok: true,
        data: {
          items: result.data.data.map(sprintTestToCard),
          pagination: result.data.pagination,
        },
      };
    },
    [examId]
  );

  return (
    <PaperList
      title="Sprint Tests"
      description="Short timed papers for quick revision."
      paperType="SPRINT"
      fetchPage={fetchPage}
    />
  );
}
