import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MockScoreCard } from "@/components/study/mock-score-card";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

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
    expect(screen.getByRole("link", { name: /Open mocks/i })).toHaveAttribute(
      "href",
      "/mocks"
    );
  });

  it("renders empty placeholders for new users", () => {
    render(<MockScoreCard data={TODAY_EMPTY_SEED.latestMock} />);

    expect(screen.getByText(/\/ 720/)).toBeInTheDocument();
    expect(screen.getByText("Your first score lands here")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mock 1: no score yet" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open mocks/i })).toHaveClass(
      "self-start"
    );
  });
});
