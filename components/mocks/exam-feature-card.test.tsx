import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExamFeatureCard } from "@/components/mocks/exam-feature-card";
import { EXAM_CARD_DESCRIPTION_MAX } from "@/lib/mocks/exam-card-copy";
import type { ApiExam } from "@/types/exam";

const exam: ApiExam = {
  id: "ex1",
  title: "NEET UG",
  description: "Medical entrance description",
  imageUrl: "",
  fullName: "Medical entrance description",
  duration: "3h",
  totalQuestions: 180,
  totalMarks: 720,
  statsLabel: "180 QUESTIONS · 180 MINUTES · 720 MARKS · +4 / -1",
  testsCount: 1,
  paperCounts: { chapterWise: 1, fullMocks: 2, sprint: 0 },
  subjectsCount: 3,
  trending: true,
};

describe("ExamFeatureCard", () => {
  it("renders description, stats, counts and deep links", () => {
    const { container } = render(<ExamFeatureCard exam={exam} />);
    expect(screen.getByRole("heading", { name: "NEET UG" })).toBeInTheDocument();
    expect(screen.getByText("Medical entrance description")).toBeInTheDocument();
    expect(screen.getByText(exam.statsLabel)).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
    const open = screen.getByRole("link", { name: "Open NEET UG →" });
    expect(open).toHaveAttribute("href", "/mocks/exam/ex1/chapter-wise");
    expect(open).toHaveClass("w-fit");
    expect(open).not.toHaveClass("w-full");
    expect(container.firstElementChild).toHaveClass("bg-study-ink");
    expect(screen.getByText("1 paper ready")).toBeInTheDocument();
    expect(screen.getByText("2 papers ready")).toBeInTheDocument();
    expect(screen.getByText("No papers yet")).toBeInTheDocument();
    expect(screen.getByText("Ready when you are.")).toBeInTheDocument();
  });

  it("pins the title to the logo bottom baseline with or without trending", () => {
    const { rerender } = render(<ExamFeatureCard exam={exam} />);
    const logo = screen.getByTestId("exam-card-logo").getBoundingClientRect();
    const titled = screen.getByRole("heading", { name: "NEET UG" }).getBoundingClientRect();
    expect(Math.abs(titled.bottom - logo.bottom)).toBeLessThanOrEqual(2);

    rerender(<ExamFeatureCard exam={{ ...exam, trending: false }} />);
    const logoAgain = screen.getByTestId("exam-card-logo").getBoundingClientRect();
    const titleAgain = screen
      .getByRole("heading", { name: "NEET UG" })
      .getBoundingClientRect();
    expect(Math.abs(titleAgain.bottom - logoAgain.bottom)).toBeLessThanOrEqual(2);
    expect(screen.queryByText("Trending")).not.toBeInTheDocument();
  });

  it("clips long descriptions with an ellipsis", () => {
    const long = "x".repeat(EXAM_CARD_DESCRIPTION_MAX + 40);
    render(<ExamFeatureCard exam={{ ...exam, description: long }} />);
    expect(screen.getByText(`${"x".repeat(EXAM_CARD_DESCRIPTION_MAX)}...`)).toBeInTheDocument();
  });

  it("renders an image avatar when imageUrl is set", () => {
    const { container } = render(
      <ExamFeatureCard
        exam={{ ...exam, imageUrl: "https://cdn.test/neet.png" }}
      />
    );
    const img = container.querySelector('img[src="https://cdn.test/neet.png"]');
    expect(img).not.toBeNull();
  });
});
