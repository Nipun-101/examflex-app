"use client";

import { useCallback } from "react";
import { PaperList } from "@/components/mocks/paper-list";
import { useResolvedExamId } from "@/hooks/use-exam-page";
import { getFullMockTests } from "@/lib/api/full-mock-tests";
import { fullMockToCard } from "@/lib/mocks/paper-card-model";
import { PAPER_PAGE_SIZE, type FetchPaperPage } from "@/lib/mocks/paper-page";

type FullMocksListProps = {
  /** Override for tests; defaults to the hub `ExamPageProvider` id. */
  examId?: string;
};

export function FullMocksList({ examId: examIdProp }: FullMocksListProps) {
  const examId = useResolvedExamId(examIdProp);

  const fetchPage = useCallback<FetchPaperPage>(
    async (page) => {
      const result = await getFullMockTests({
        examId,
        page,
        limit: PAPER_PAGE_SIZE,
      });
      if (!result.ok) return result;
      return {
        ok: true,
        data: {
          items: result.data.data.map(fullMockToCard),
          pagination: result.data.pagination,
        },
      };
    },
    [examId]
  );

  return (
    <PaperList
      title="Full Mocks"
      description="Full-length papers that mirror the real exam."
      emptyMessage="Full Mocks for this exam will show up here soon."
      fetchPage={fetchPage}
    />
  );
}
