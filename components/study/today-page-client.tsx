"use client";

import { useEffect, useState } from "react";
import { ExamChoiceModal } from "@/components/equation-book/exam-choice-modal";
import { TodayPageView } from "@/components/study/today-page";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { getToday } from "@/lib/api/today";
import { getMyProfile } from "@/lib/api/users";
import { optionalField } from "@/lib/api/parse-fields";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";
import { resolveEquationExam } from "@/lib/equation-book/resolve-exam";
import { persistTargetExam } from "@/lib/profile/persist-target-exam";
import { TODAY_EMPTY_SEED } from "@/lib/today/static-data";
import type { EquationExamOption } from "@/types/equation-book";
import type { TodayPageData } from "@/types/today";

type BootState =
  | { status: "loading" }
  | { status: "ready"; data: TodayPageData }
  | { status: "error"; message: string; data: TodayPageData };

export function TodayPageClient() {
  const [boot, setBoot] = useState<BootState>({ status: "loading" });
  const [chooseExams, setChooseExams] = useState<EquationExamOption[] | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function bootPage() {
      setBoot({ status: "loading" });
      const [profileResult, exams] = await Promise.all([
        getMyProfile(),
        listShowInAppExams(),
      ]);
      if (cancelled) return;

      const preferred =
        profileResult.ok && profileResult.data.targetExam
          ? profileResult.data.targetExam.id
          : undefined;

      const resolved = resolveEquationExam({
        ...optionalField("preferredExamId", preferred),
        availableExams: exams,
      });

      if (resolved.kind === "none") {
        setBoot({ status: "ready", data: TODAY_EMPTY_SEED });
        setChooseExams(null);
        return;
      }

      if (resolved.kind === "choose") {
        setChooseExams(resolved.exams);
        setBoot({ status: "ready", data: TODAY_EMPTY_SEED });
        return;
      }

      if (!preferred) {
        void persistTargetExam(resolved.exam.id);
      }

      await loadToday(resolved.exam, cancelled);
    }

    async function loadToday(
      exam: EquationExamOption,
      cancelledFlag: boolean
    ) {
      const result = await getToday(exam.id);
      if (cancelledFlag) return;
      if (!result.ok) {
        setBoot({
          status: "error",
          message: result.message,
          data: TODAY_EMPTY_SEED,
        });
        return;
      }
      setChooseExams(null);
      setBoot({ status: "ready", data: result.data });
    }

    void bootPage();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectExam = async (exam: EquationExamOption) => {
    setBoot({ status: "loading" });
    await persistTargetExam(exam.id);
    const result = await getToday(exam.id);
    if (!result.ok) {
      setBoot({
        status: "error",
        message: result.message,
        data: TODAY_EMPTY_SEED,
      });
      return;
    }
    setChooseExams(null);
    setBoot({ status: "ready", data: result.data });
  };

  if (boot.status === "loading") {
    return <StudyRouteLoading busy />;
  }

  const data =
    boot.status === "ready" || boot.status === "error"
      ? boot.data
      : TODAY_EMPTY_SEED;

  return (
    <>
      <TodayPageView
        data={data}
        errorMessage={boot.status === "error" ? boot.message : null}
      />
      <ExamChoiceModal
        open={Boolean(chooseExams && chooseExams.length > 0)}
        exams={chooseExams ?? []}
        title="Set your target exam"
        body="Today is scoped to one exam. Pick NEET, JEE, or another ExamFlex exam to see your next step and mock insights."
        onSelect={(exam) => {
          void handleSelectExam(exam);
        }}
      />
    </>
  );
}
