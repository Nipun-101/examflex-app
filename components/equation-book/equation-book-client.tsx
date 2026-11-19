"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EquationBookView } from "@/components/equation-book/equation-book-view";
import { ExamChoiceModal } from "@/components/equation-book/exam-choice-modal";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { listEquations } from "@/lib/api/equation-book";
import { optionalField } from "@/lib/api/parse-fields";
import { getSubjectsForExam } from "@/lib/api/exams";
import { getMyProfile } from "@/lib/api/users";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";
import { resolveEquationExam } from "@/lib/equation-book/resolve-exam";
import { defaultSubjectAndChapter } from "@/lib/equation-book/selectors";
import { persistTargetExam } from "@/lib/profile/persist-target-exam";
import type { ApiSubjectForExam } from "@/types/exam";
import type {
  EquationExamOption,
  EquationItem,
} from "@/types/equation-book";

export function EquationBookClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bootLoading, setBootLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableExams, setAvailableExams] = useState<EquationExamOption[]>(
    []
  );
  const [preferredExamId, setPreferredExamId] = useState<string | undefined>();
  const [exam, setExam] = useState<EquationExamOption | null>(null);
  const [chooseExams, setChooseExams] = useState<EquationExamOption[] | null>(
    null
  );
  const [subjects, setSubjects] = useState<ApiSubjectForExam[]>([]);
  const [cards, setCards] = useState<EquationItem[]>([]);
  const [subjectId, setSubjectId] = useState(
    searchParams.get("subjectId") ?? ""
  );
  const [topicId, setTopicId] = useState(searchParams.get("topicId") ?? "");
  const equationId = searchParams.get("equationId") ?? undefined;
  const canLoadCards = Boolean(exam && subjectId && topicId);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setBootLoading(true);
      setError(null);

      const [profileResult, exams] = await Promise.all([
        getMyProfile(),
        listShowInAppExams(),
      ]);

      if (cancelled) return;

      setAvailableExams(exams);
      const preferred =
        profileResult.ok && profileResult.data.targetExam
          ? profileResult.data.targetExam.id
          : undefined;
      setPreferredExamId(preferred);

      const resolved = resolveEquationExam({
        ...optionalField("preferredExamId", preferred),
        availableExams: exams,
      });

      if (resolved.kind === "resolved") {
        setExam(resolved.exam);
        setPreferredExamId(resolved.exam.id);
        // Persist when the student had no preferred exam but only one showInApp option.
        if (!preferred) {
          void persistTargetExam(resolved.exam.id);
        }
      } else if (resolved.kind === "choose") {
        setChooseExams(resolved.exams);
      } else {
        setError("No exams are available in ExamFlex yet.");
      }

      setBootLoading(false);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!exam) return;
    let cancelled = false;
    const preferredSubject = searchParams.get("subjectId") ?? subjectId;
    const preferredTopic = searchParams.get("topicId") ?? topicId;

    async function loadSubjects() {
      const result = await getSubjectsForExam(exam!.id);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSubjects(result.data);
      const { subjectId: nextSubject, topicId: nextTopic } =
        defaultSubjectAndChapter(
          result.data,
          preferredSubject,
          preferredTopic
        );
      setSubjectId(nextSubject);
      setTopicId(nextTopic);
      const params = new URLSearchParams(searchParams.toString());
      if (nextSubject) params.set("subjectId", nextSubject);
      else params.delete("subjectId");
      if (nextTopic) params.set("topicId", nextTopic);
      else params.delete("topicId");
      const query = params.toString();
      router.replace(query ? `/equation-book?${query}` : "/equation-book");
    }

    void loadSubjects();
    return () => {
      cancelled = true;
    };
    // Catalog reload is exam-scoped; URL prefs are read once per exam change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid replace→searchParams loops
  }, [exam]);

  useEffect(() => {
    if (!canLoadCards || !exam) {
      return;
    }

    const examId = exam.id;
    let cancelled = false;

    async function loadCards() {
      setCardsLoading(true);
      const result = await listEquations({
        examId,
        subjectId,
        topicId,
        page: 1,
        limit: 100,
      });
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setCards([]);
      } else {
        setCards(result.data.items);
      }
      setCardsLoading(false);
    }

    void loadCards();
    return () => {
      cancelled = true;
    };
  }, [canLoadCards, exam, subjectId, topicId]);

  if (bootLoading) {
    return <StudyRouteLoading busy />;
  }

  if (error && !exam) {
    return (
      <p className="rounded-[20px] bg-white p-6 text-sm text-study-muted-soft shadow-soft">
        {error}
      </p>
    );
  }

  return (
    <>
      {exam ? (
        <EquationBookView
          examId={exam.id}
          examName={exam.name}
          availableExams={availableExams}
          {...optionalField("preferredExamId", preferredExamId)}
          subjects={subjects}
          cards={canLoadCards ? cards : []}
          initialSubjectId={subjectId}
          initialTopicId={topicId}
          {...optionalField("initialEquationId", equationId)}
          loadingCards={cardsLoading}
          onFiltersChange={({ subjectId: nextSubject, topicId: nextTopic }) => {
            setSubjectId(nextSubject);
            setTopicId(nextTopic);
            const params = new URLSearchParams();
            if (nextSubject) params.set("subjectId", nextSubject);
            if (nextTopic) params.set("topicId", nextTopic);
            const query = params.toString();
            router.replace(query ? `/equation-book?${query}` : "/equation-book");
          }}
        />
      ) : null}

      <ExamChoiceModal
        open={chooseExams != null && exam == null}
        exams={chooseExams ?? []}
        title="Which exam's Equation Book?"
        body="You don't have a preferred exam yet. Pick one to continue — we'll save it to your profile."
        onSelect={(selected) => {
          setExam(selected);
          setPreferredExamId(selected.id);
          setChooseExams(null);
          void persistTargetExam(selected.id);
        }}
      />
    </>
  );
}
