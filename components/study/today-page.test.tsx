import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayPageView } from "@/components/study/today-page";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("TodayPageView", () => {
  it("renders overview and workspace from static data", () => {
    render(<TodayPageView data={TODAY_PAGE_DATA} />);

    expect(
      screen.getByRole("heading", { name: "One good step at a time." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Study workspace" })
    ).toBeInTheDocument();
  });
});
