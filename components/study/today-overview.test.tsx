import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayOverview } from "@/components/study/today-overview";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("TodayOverview", () => {
  it("renders headline, subhead, and pace badge", () => {
    render(
      <TodayOverview
        eyebrow={TODAY_PAGE_DATA.overview.eyebrow}
        headline={TODAY_PAGE_DATA.overview.headline}
        subhead={TODAY_PAGE_DATA.overview.subhead}
        paceBadge={TODAY_PAGE_DATA.overview.paceBadge}
      />
    );

    expect(
      screen.getByRole("heading", { name: "One good step at a time." })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Not more things to study. A clearer idea of what to do next."
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Your pace, your plan/)).toBeInTheDocument();
  });
});
