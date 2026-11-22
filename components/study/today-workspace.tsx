import { EquationBookCard } from "@/components/study/equation-book-card";
import { MistakeBookCard } from "@/components/study/mistake-book-card";
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
 * Desktop: left = next step → score → subjects;
 * right = session → mock → perspective → equation → mistake.
 * Mobile (via `order-*`): next step → score → equation → perspective → mock → subjects → mistake → session.
 */
export function TodayWorkspace({ data }: TodayWorkspaceProps) {
  return (
    <section aria-label="Study workspace" className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.83fr)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
        <div className="contents lg:flex lg:h-full lg:flex-col lg:gap-5">
          <div className="order-1 lg:order-none">
            <NextStepCard data={data.nextStep} />
          </div>
          <div className="order-2 lg:order-none">
            <MockScoreCard data={data.latestMock} />
          </div>
          <div className="order-6 lg:order-none lg:flex lg:flex-1 lg:flex-col">
            <SubjectInsightsCard
              section={data.subjectInsights}
              className="lg:flex-1"
            />
          </div>
        </div>

        <div className="contents lg:flex lg:h-full lg:flex-col lg:gap-5">
          <div className="order-8 lg:order-none">
            <SessionPlanCard data={data.sessionPlan} />
          </div>
          <div className="order-5 lg:order-none">
            <NextMockCard data={data.nextMock} />
          </div>
          <div className="order-4 lg:order-none lg:flex lg:flex-1 lg:flex-col">
            <PerspectiveCard data={data.perspective} className="lg:flex-1" />
          </div>
          <div className="order-3 lg:order-none">
            <EquationBookCard data={data.equationBook} />
          </div>
          <div className="order-7 lg:order-none">
            <MistakeBookCard data={data.mistakeBook} />
          </div>
        </div>
      </div>

      <p className="pt-2 text-right text-[0.625rem] leading-[1.4] text-study-muted-soft">
        {data.footerRight}
      </p>
    </section>
  );
}
