import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExamHubNav, examHubTabs } from "@/components/mocks/exam-hub-nav";

let pathname = "/mocks/exam/ex1/chapter-wise";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

describe("ExamHubNav", () => {
  beforeEach(() => {
    pathname = "/mocks/exam/ex1/chapter-wise";
  });

  it("lists the three paper-type tabs", () => {
    expect(examHubTabs("ex1").map((tab) => tab.label)).toEqual([
      "Chapter Wise",
      "Full Mocks",
      "Sprint",
    ]);
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Chapter Wise" })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1/chapter-wise"
    );
    expect(screen.getByRole("link", { name: "Full Mocks" })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1/full-mocks"
    );
    const sprint = screen.getByRole("link", { name: "Sprint" });
    expect(sprint).toHaveAttribute("href", "/mocks/exam/ex1/sprint-tests");
    expect(sprint).toHaveClass("hover:bg-study-mint");
    expect(sprint).not.toHaveClass("hover:bg-study-canvas");
    expect(screen.queryByRole("link", { name: "Overview" })).not.toBeInTheDocument();
  });

  it("marks Chapter Wise active on its route", () => {
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Chapter Wise" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("marks a list tab active on its route", () => {
    pathname = "/mocks/exam/ex1/full-mocks";
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Full Mocks" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      screen.getByRole("link", { name: "Chapter Wise" })
    ).not.toHaveAttribute("aria-current");
  });

  it("keeps a list tab active on nested routes", () => {
    pathname = "/mocks/exam/ex1/sprint-tests/extra";
    render(<ExamHubNav examId="ex1" />);
    expect(screen.getByRole("link", { name: "Sprint" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
