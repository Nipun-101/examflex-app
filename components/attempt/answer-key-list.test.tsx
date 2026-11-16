import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnswerKeyList } from "@/components/attempt/answer-key-list";
import { makeQuestion } from "@/test-utils/attempt-fixtures";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";
import type { AttemptQuestion, SubmittedQuestionResult } from "@/types/attempt";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

function results(
  items: SubmittedQuestionResult[]
): Map<string, SubmittedQuestionResult> {
  return new Map(items.map((item) => [item.questionId, item]));
}

function renderList(
  questions: AttemptQuestion[],
  resultItems: SubmittedQuestionResult[],
  overrides: Partial<Parameters<typeof AnswerKeyList>[0]> = {}
) {
  return render(
    <AnswerKeyList
      questions={questions}
      resultsByQuestion={results(resultItems)}
      paperIndexById={new Map(questions.map((q, i) => [q._id, i]))}
      sectionByQuestionId={new Map()}
      showSectionHeadings={false}
      language="en"
      {...overrides}
    />
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AnswerKeyList", () => {
  it("shows an empty message when there are no questions", () => {
    renderList([], []);
    expect(screen.getByText(/could not be loaded/)).toBeInTheDocument();
  });

  it("marks correct, incorrect and skipped questions", () => {
    const questions = [
      makeQuestion("q1", { difficultyLevel: "easy" }),
      makeQuestion("q2", { difficultyLevel: "medium" }),
      makeQuestion("q3", { difficultyLevel: "hard" }),
    ];
    renderList(questions, [
      { questionId: "q1", selectedOption: "q1-a", correctAnswer: "q1-a", isCorrect: true, marksAwarded: 4 },
      { questionId: "q2", selectedOption: "q2-b", correctAnswer: "q2-a", isCorrect: false, marksAwarded: -1 },
      { questionId: "q3", selectedOption: null, correctAnswer: "q3-a", isCorrect: false, marksAwarded: 0 },
    ]);
    expect(screen.getAllByRole("img", { name: "Correct" })).toHaveLength(1);
    expect(screen.getAllByRole("img", { name: "Incorrect" })).toHaveLength(1);
    expect(screen.getAllByRole("img", { name: "Not attempted" })).toHaveLength(1);
    expect(screen.getByText("easy")).toBeInTheDocument();
    expect(screen.getByText("hard")).toBeInTheDocument();
    // Correct answer and the student's wrong pick are called out for screen readers.
    expect(screen.getAllByText("Correct answer:").length).toBe(3);
    expect(screen.getByText("Your answer:")).toBeInTheDocument();
  });

  it("treats a question without a result as skipped", () => {
    renderList([makeQuestion("q1")], []);
    expect(screen.getByRole("img", { name: "Not attempted" })).toBeInTheDocument();
  });

  it("uses the paper position for numbering with a fallback", () => {
    const questions = [makeQuestion("q1"), makeQuestion("q2")];
    renderList(questions, [], {
      paperIndexById: new Map([["q2", 14]]),
    });
    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Question 15")).toBeInTheDocument();
  });

  it("shows explanations in the chosen language with fallback and image", () => {
    const questions = [makeQuestion("q1")];
    renderList(
      questions,
      [
        {
          questionId: "q1",
          selectedOption: "q1-a",
          correctAnswer: "q1-a",
          isCorrect: true,
          marksAwarded: 4,
          explanation: { en: "English why", ml: null, imageUrl: "https://cdn/e.png" },
        },
      ],
      { language: "ml" }
    );
    expect(screen.getByText("English why")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Explanation" })).toBeInTheDocument();
  });

  it("omits the explanation card when none exists", () => {
    renderList([makeQuestion("q1")], [
      {
        questionId: "q1",
        selectedOption: "q1-a",
        correctAnswer: "q1-a",
        isCorrect: true,
        marksAwarded: 4,
        explanation: { en: null, ml: null, imageUrl: null },
      },
    ]);
    expect(screen.queryByText("Explanation")).not.toBeInTheDocument();
  });

  it("renders image options", () => {
    renderList(
      [
        makeQuestion("q1", {
          options: [{ id: "i1", type: "image", en: "", ml: "", imageUrl: "https://cdn/o.png" }],
        }),
      ],
      []
    );
    expect(screen.getByRole("img", { name: "Option" })).toHaveAttribute("src", "https://cdn/o.png");
  });

  it("adds section headings only when the section changes", () => {
    const questions = [makeQuestion("q1"), makeQuestion("q2"), makeQuestion("q3")];
    renderList(questions, [], {
      showSectionHeadings: true,
      sectionByQuestionId: new Map([
        ["q1", "Physics"],
        ["q2", "Physics"],
        ["q3", "Chemistry"],
      ]),
    });
    expect(screen.getAllByRole("heading", { level: 3, name: "Physics" })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 3, name: "Chemistry" })).toHaveLength(1);
  });

  it("hides headings when disabled", () => {
    renderList([makeQuestion("q1")], [], {
      showSectionHeadings: false,
      sectionByQuestionId: new Map([["q1", "Physics"]]),
    });
    expect(screen.queryByRole("heading", { level: 3, name: "Physics" })).not.toBeInTheDocument();
  });

  it("renders long papers in batches", () => {
    const questions = Array.from({ length: 20 }, (_, i) => makeQuestion(`q${i}`));
    renderList(questions, []);
    expect(screen.getAllByText(/^Question \d+$/)).toHaveLength(8);
    expect(screen.getByRole("status")).toHaveTextContent("Loading questions 8 of 20");

    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(screen.getAllByText(/^Question \d+$/)).toHaveLength(16);

    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(screen.getAllByText(/^Question \d+$/)).toHaveLength(20);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("restarts batching when the filtered list changes", () => {
    const all = Array.from({ length: 20 }, (_, i) => makeQuestion(`q${i}`));
    const { rerender } = renderList(all, []);
    act(() => {
      vi.advanceTimersByTime(40);
    });
    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(screen.getAllByText(/^Question \d+$/)).toHaveLength(20);

    const filtered = all.slice(0, 3);
    rerender(
      <AnswerKeyList
        questions={filtered}
        resultsByQuestion={new Map()}
        paperIndexById={new Map()}
        sectionByQuestionId={new Map()}
        showSectionHeadings={false}
        language="en"
      />
    );
    expect(screen.getAllByText(/^Question \d+$/)).toHaveLength(3);
  });
});
