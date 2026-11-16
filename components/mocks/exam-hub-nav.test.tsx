import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExamHubNav, examHubTabs } from "@/components/mocks/exam-hub-nav";

let pathname = "/mocks/exam/ex1";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

describe("ExamHubNav", () => {
  beforeEach(() => {
    pathname = "/mocks/exam/ex1";
  });

  it("lists the four tabs with Chapter Wise for TOPIC_WISE", () => {
    expect(examHubTabs("ex1").map((tab) => tab.label)).toEqual([
      "Overview",
      "Chapter Wise",
      "Full Mocks",
      "Sprint Tests",
    ]);
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1"
    );
    expect(screen.getByRole("link", { name: "Chapter Wise" })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1/chapter-wise"
    );
    expect(screen.getByRole("link", { name: "Full Mocks" })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1/full-mocks"
    );
    expect(screen.getByRole("link", { name: "Sprint Tests" })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1/sprint-tests"
    );
  });

  it("marks only Overview active on the hub root", () => {
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      screen.getByRole("link", { name: "Chapter Wise" })
    ).not.toHaveAttribute("aria-current");
  });

  it("marks a list tab active on its route", () => {
    pathname = "/mocks/exam/ex1/full-mocks";
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Full Mocks" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      screen.getByRole("link", { name: "Overview" })
    ).not.toHaveAttribute("aria-current");
  });

  it("keeps a list tab active on nested routes", () => {
    pathname = "/mocks/exam/ex1/sprint-tests/extra";
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Sprint Tests" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
