import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeBookSummaryCard } from "@/components/mistake-book/mistake-book-summary-card";

describe("MistakeBookSummaryCard", () => {
  it("renders totals, subject breakdown, and start CTA", () => {
    render(
      <MistakeBookSummaryCard
        summary={{
          totalMistakes: 22,
          sessionCount: 4,
          bySubject: [
            { id: "s1", label: "Physics", count: 15 },
            { id: "s2", label: "Chemistry", count: 4 },
            { id: "s3", label: "Biology", count: 3 },
          ],
          subjects: [
            { id: "s1", label: "Physics" },
            { id: "s2", label: "Chemistry" },
            { id: "s3", label: "Biology" },
          ],
          chapters: [
            { id: "t1", label: "Kinematics", subjectId: "s1" },
          ],
          startWith: { mockTestId: "mt-k", title: "Kinematics - 1" },
        }}
      />
    );

    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText(/across 4 tests/i)).toBeInTheDocument();
    expect(screen.getByText("Physics 15")).toBeInTheDocument();
    expect(screen.getByText("Chemistry 4")).toBeInTheDocument();
    expect(screen.getByText("Biology 3")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Wrong answers and blanks both count\. Clear them when the idea sticks\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start with Kinematics - 1/i })
    ).toHaveAttribute("href", "/mistake-book/mt-k");
  });

  it("rounds only the outer ends of the subject bar", () => {
    const { container } = render(
      <MistakeBookSummaryCard
        summary={{
          totalMistakes: 22,
          sessionCount: 4,
          bySubject: [
            { id: "s1", label: "Physics", count: 15 },
            { id: "s2", label: "Chemistry", count: 4 },
            { id: "s3", label: "Biology", count: 3 },
          ],
          subjects: [],
          chapters: [],
          startWith: null,
        }}
      />
    );

    const segments = container.querySelectorAll('[aria-hidden="true"] > span');
    expect(segments).toHaveLength(3);
    expect(segments[0]).toHaveClass("rounded-l-full");
    expect(segments[1]).toHaveClass("rounded-none");
    expect(segments[2]).toHaveClass("rounded-r-full");
  });

  it("gives Physics and Physics Core different bar colors", () => {
    const { container } = render(
      <MistakeBookSummaryCard
        summary={{
          totalMistakes: 10,
          sessionCount: 2,
          bySubject: [
            { id: "s1", label: "Physics", count: 4 },
            { id: "s2", label: "Physics Core", count: 3 },
            { id: "s3", label: "Chemistry", count: 3 },
          ],
          subjects: [],
          chapters: [],
          startWith: null,
        }}
      />
    );

    const segments = container.querySelectorAll('[aria-hidden="true"] > span');
    const colors = [...segments].map(
      (el) => (el as HTMLElement).style.backgroundColor
    );
    expect(new Set(colors).size).toBe(3);
  });
});
