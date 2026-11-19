import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisSubjectsSection } from "@/components/analysis/analysis-subjects-section";

describe("AnalysisSubjectsSection", () => {
  it("shows unlock overlay when no chapter-wise data", () => {
    render(
      <AnalysisSubjectsSection
        examId="exam-neet"
        subjects={{
          source: "TOPIC_WISE",
          attemptCount: 0,
          needsMoreAttempts: true,
          items: [],
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Subject & chapter insights" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Unlock subject & chapter insights",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open chapter wise/i })
    ).toHaveAttribute("href", "/mocks/exam/exam-neet/chapter-wise");
  });

  it("renders subject cards", () => {
    render(
      <AnalysisSubjectsSection
        examId="exam-neet"
        subjects={{
          source: "TOPIC_WISE",
          attemptCount: 2,
          needsMoreAttempts: false,
          items: [
            {
              subjectId: "s1",
              subjectName: "Physics",
              attemptCount: 2,
              averagePercent: 42,
              strengthLabel: "Weak",
              tip: "Force & friction need another look.",
              topics: [
                {
                  topicId: "t1",
                  topicName: "Laws of Motion",
                  attemptCount: 1,
                  averagePercent: 40,
                  isWeak: true,
                  isStrong: false,
                },
              ],
            },
          ],
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Physics" })).toBeInTheDocument();
    expect(screen.getByText(/Force & friction/i)).toBeInTheDocument();
    expect(screen.getByText("Laws of Motion")).toBeInTheDocument();
  });
});
