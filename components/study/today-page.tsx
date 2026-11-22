import { TodayOverview } from "@/components/study/today-overview";
import { TodayWorkspace } from "@/components/study/today-workspace";
import type { TodayPageData } from "@/types/today";

type TodayPageViewProps = {
  data: TodayPageData;
  errorMessage?: string | null;
};

export function TodayPageView({
  data,
  errorMessage = null,
}: TodayPageViewProps) {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      {errorMessage ? (
        <p
          role="alert"
          className="rounded-[12px] border border-study-peach bg-study-peach/30 px-4 py-3 text-sm text-study-ink"
        >
          {errorMessage}
        </p>
      ) : null}
      <TodayOverview
        eyebrow={data.overview.eyebrow}
        headline={data.overview.headline}
        paceBadge={data.overview.paceBadge}
      />
      <TodayWorkspace data={data} />
    </div>
  );
}
