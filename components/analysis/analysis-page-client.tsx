"use client";

import { useEffect, useMemo, useState } from "react";
import { AnalysisView } from "@/components/analysis/analysis-view";
import { ExamChoiceModal } from "@/components/equation-book/exam-choice-modal";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { getAnalysisOverview } from "@/lib/api/analysis";
import { getMyCounseling } from "@/lib/api/counseling";
import { getMyProfile } from "@/lib/api/users";
import { optionalField } from "@/lib/api/parse-fields";
import {
  ANALYSIS_PAGE_DATA,
  buildAnalysisPageData,
} from "@/lib/analysis/static-data";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";
import { resolveEquationExam } from "@/lib/equation-book/resolve-exam";
import {
  displayEmailFromApi,
  displayPhoneFromApi,
} from "@/lib/profile/map-user";
import { persistTargetExam } from "@/lib/profile/persist-target-exam";
import type { AnalysisPageData } from "@/types/analysis";
import type { CounselingPrefill } from "@/types/counseling";
import type { EquationExamOption } from "@/types/equation-book";
import type { ApiUserProfile } from "@/types/user";

type BootState =
  | { status: "loading" }
  | { status: "ready"; data: AnalysisPageData }
  | { status: "error"; message: string; data: AnalysisPageData };

export function AnalysisPageClient() {
  const [boot, setBoot] = useState<BootState>({ status: "loading" });
  const [chooseExams, setChooseExams] = useState<EquationExamOption[] | null>(
    null
  );
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [canRequestCounseling, setCanRequestCounseling] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootPage() {
      setBoot({ status: "loading" });
      const [profileResult, exams, counselingResult] = await Promise.all([
        getMyProfile(),
        listShowInAppExams(),
        getMyCounseling(),
      ]);
      if (cancelled) return;

      if (profileResult.ok) {
        setProfile(profileResult.data);
      } else {
        setProfile(null);
      }

      if (counselingResult.ok) {
        setCanRequestCounseling(counselingResult.data.canRequest);
      } else {
        setCanRequestCounseling(true);
      }

      const preferred =
        profileResult.ok && profileResult.data.targetExam
          ? profileResult.data.targetExam.id
          : undefined;

      const resolved = resolveEquationExam({
        ...optionalField("preferredExamId", preferred),
        availableExams: exams,
      });

      if (resolved.kind === "none") {
        setBoot({
          status: "ready",
          data: ANALYSIS_PAGE_DATA,
        });
        setChooseExams(null);
        return;
      }

      if (resolved.kind === "choose") {
        setChooseExams(resolved.exams);
        setBoot({
          status: "ready",
          data: ANALYSIS_PAGE_DATA,
        });
        return;
      }

      if (!preferred) {
        void persistTargetExam(resolved.exam.id);
      }

      await loadOverview(resolved.exam, cancelled);
    }

    async function loadOverview(
      exam: EquationExamOption,
      cancelledFlag: boolean
    ) {
      const result = await getAnalysisOverview(exam.id);
      if (cancelledFlag) return;
      if (!result.ok) {
        setBoot({
          status: "error",
          message: result.message,
          data: ANALYSIS_PAGE_DATA,
        });
        return;
      }
      setChooseExams(null);
      setBoot({
        status: "ready",
        data: buildAnalysisPageData(result.data),
      });
    }

    void bootPage();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectExam = async (exam: EquationExamOption) => {
    setBoot({ status: "loading" });
    await persistTargetExam(exam.id);
    const result = await getAnalysisOverview(exam.id);
    if (!result.ok) {
      setBoot({
        status: "error",
        message: result.message,
        data: ANALYSIS_PAGE_DATA,
      });
      return;
    }
    setChooseExams(null);
    setBoot({
      status: "ready",
      data: buildAnalysisPageData(result.data),
    });
  };

  const counselingPrefill = useMemo((): CounselingPrefill => {
    return {
      studentName: profile?.name?.trim() ?? "",
      email: displayEmailFromApi(profile?.email ?? ""),
      phone: displayPhoneFromApi(profile?.phoneNumber),
      state: profile?.location?.state?.trim() ?? "",
      courseInterestedIn: profile?.targetExam?.name?.trim() ?? "",
      expectedMark: "",
      latestMockScore: null,
      latestMockMaxScore: null,
    };
  }, [profile]);

  if (boot.status === "loading") {
    return <StudyRouteLoading busy />;
  }

  const data =
    boot.status === "ready" || boot.status === "error"
      ? boot.data
      : ANALYSIS_PAGE_DATA;

  return (
    <>
      {boot.status === "error" ? (
        <p className="mb-4 rounded-[12px] bg-study-peach px-3.5 py-3 text-sm text-study-peach-ink">
          {boot.message}
        </p>
      ) : null}
      <AnalysisView
        data={data}
        canRequestCounseling={canRequestCounseling}
        counselingPrefill={counselingPrefill}
        onCounselingBooked={() => setCanRequestCounseling(false)}
      />
      <ExamChoiceModal
        open={Boolean(chooseExams && chooseExams.length > 0)}
        exams={chooseExams ?? []}
        title="Set your target exam"
        body="Analysis is scoped to one exam. Pick NEET, JEE, or another ExamFlex exam to see full-mock form and course pathways."
        onSelect={(exam) => {
          void handleSelectExam(exam);
        }}
      />
    </>
  );
}
