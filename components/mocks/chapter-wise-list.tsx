"use client";

import { useCallback, useEffect, useState } from "react";
import { ChapterWiseFilters } from "@/components/mocks/chapter-wise-filters";
import { PaperList } from "@/components/mocks/paper-list";
import { useResolvedExamId } from "@/hooks/use-exam-page";
import { getSubjectsForExam } from "@/lib/api/exams";
import { getMockTestsByExam } from "@/lib/api/mock-tests";
import { chapterPaperToCard } from "@/lib/mocks/paper-card-model";
import { PAPER_PAGE_SIZE, type FetchPaperPage } from "@/lib/mocks/paper-page";
import type { ApiSubjectForExam } from "@/types/exam";

type ChapterWiseListProps = {
  /** Override for tests; defaults to the hub `ExamPageProvider` id. */
  examId?: string;
};

/** Chapter Wise = TOPIC_WISE papers. */
export function ChapterWiseList({ examId: examIdProp }: ChapterWiseListProps) {
  const examId = useResolvedExamId(examIdProp);
  const [subjects, setSubjects] = useState<ApiSubjectForExam[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [filterKey, setFilterKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void getSubjectsForExam(examId).then((result) => {
      if (cancelled || !result.ok) return;
      setSubjects(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const fetchPage = useCallback<FetchPaperPage>(
    async (page) => {
      const result = await getMockTestsByExam(examId, {
        page,
        limit: PAPER_PAGE_SIZE,
        ...(subjectId ? { subjectId } : {}),
        ...(topicId ? { topicId } : {}),
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
    [examId, subjectId, topicId]
  );

  function handleSubjectChange(next: string) {
    setSubjectId(next);
    setTopicId("");
    setFilterKey((key) => key + 1);
  }

  function handleTopicChange(next: string) {
    setTopicId(next);
    setFilterKey((key) => key + 1);
  }

  return (
    <div className="space-y-4">
      {subjects.length > 0 ? (
        <ChapterWiseFilters
          subjects={subjects}
          subjectId={subjectId}
          topicId={topicId}
          onSubjectChange={handleSubjectChange}
          onTopicChange={handleTopicChange}
        />
      ) : null}
      <PaperList
        key={`${examId}-${filterKey}`}
        title="Chapter Wise"
        description="Focused papers by chapter and topic."
        paperType="TOPIC_WISE"
        fetchPage={fetchPage}
      />
    </div>
  );
}
