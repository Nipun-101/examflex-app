import { TodayOverview } from "@/components/study/today-overview";
import { TodayWorkspace } from "@/components/study/today-workspace";
import type { TodayPageData } from "@/types/today";

type TodayPageViewProps = {
  data: TodayPageData;
};

export function TodayPageView({ data }: TodayPageViewProps) {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <TodayOverview
        eyebrow={data.eyebrow}
        headline={data.headline}
        subhead={data.subhead}
        paceBadge={data.paceBadge}
      />
      <TodayWorkspace data={data} />
    </div>
  );
}
