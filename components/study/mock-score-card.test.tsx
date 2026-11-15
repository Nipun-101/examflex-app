import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MockScoreCard } from "@/components/study/mock-score-card";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("MockScoreCard", () => {
  it("renders score summary and visible attempt bars", () => {
    render(<MockScoreCard data={TODAY_PAGE_DATA.latestMock} />);

    expect(
      screen.getByRole("heading", { name: "A score is a starting point." })
    ).toBeInTheDocument();
    expect(screen.getAllByText("548").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/\/ 720/)).toBeInTheDocument();
    expect(screen.getByText("+18 from Mock 11")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mock 10: 512 of 720" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mock 12: 548 of 720" })
    ).toBeInTheDocument();
  });
});
