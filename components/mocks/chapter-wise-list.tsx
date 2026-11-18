"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get("subjectId") ?? "";
  const initialTopicId = searchParams.get("topicId") ?? "";
  const [subjects, setSubjects] = useState<ApiSubjectForExam[]>([]);
  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [topicId, setTopicId] = useState(initialTopicId);
  const [filterKey, setFilterKey] = useState(0);
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getSubjectsForExam(examId).then((result) => {
      if (cancelled || !result.ok) {
        if (!cancelled) setFiltersReady(true);
        return;
      }
      setSubjects(result.data);

      const nextSubject =
        initialSubjectId &&
        result.data.some((subject) => subject.id === initialSubjectId)
          ? initialSubjectId
          : "";
      const topics =
        result.data.find((subject) => subject.id === nextSubject)?.topics ??
        [];
      const nextTopic =
        nextSubject &&
        initialTopicId &&
        topics.some((topic) => topic.id === initialTopicId)
          ? initialTopicId
          : "";
      setSubjectId(nextSubject);
      setTopicId(nextTopic);
      setFiltersReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [examId, initialSubjectId, initialTopicId]);

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
      {filtersReady ? (
        <PaperList
          key={`${examId}-${filterKey}-${subjectId}-${topicId}`}
          title="Chapter Wise"
          description="Focused papers by chapter and topic."
          paperType="TOPIC_WISE"
          fetchPage={fetchPage}
        />
      ) : null}
    </div>
  );
}
