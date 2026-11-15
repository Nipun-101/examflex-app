import { EquationBookCard } from "@/components/study/equation-book-card";
import { MockScoreCard } from "@/components/study/mock-score-card";
import { NextMockCard } from "@/components/study/next-mock-card";
import { NextStepCard } from "@/components/study/next-step-card";
import { PerspectiveCard } from "@/components/study/perspective-card";
import { SessionPlanCard } from "@/components/study/session-plan-card";
import { SubjectInsightsCard } from "@/components/study/subject-insights-card";
import type { TodayPageData } from "@/types/today";

type TodayWorkspaceProps = {
  data: TodayPageData;
};

/**
 * Figma layout: continuous two columns —
 * left = next step → score → subjects;
 * right = session plan → equation → mock → perspective.
 * On large screens both columns stretch so the bottom cards share one baseline.
 */
export function TodayWorkspace({ data }: TodayWorkspaceProps) {
  return (
    <section aria-label="Study workspace" className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.83fr)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
        <div className="flex flex-col gap-4 lg:h-full lg:gap-5">
          <NextStepCard data={data.nextStep} />
          <MockScoreCard data={data.latestMock} />
          <SubjectInsightsCard
            title="Where your next session can help"
            insights={data.subjectInsights}
            className="lg:flex-1"
          />
        </div>

        <div className="flex flex-col gap-4 lg:h-full lg:gap-5">
          <SessionPlanCard data={data.sessionPlan} />
          <EquationBookCard data={data.equationBook} />
          <NextMockCard data={data.nextMock} />
          <PerspectiveCard data={data.perspective} className="lg:flex-1" />
        </div>
      </div>

      <p className="pt-2 text-right text-[0.625rem] leading-[1.4] text-study-muted-soft">
        {data.footerRight}
      </p>
    </section>
  );
}
